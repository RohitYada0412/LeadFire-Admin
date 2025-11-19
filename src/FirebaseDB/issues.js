// src/FirebaseDB/zones.js
import { getApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  GeoPoint,
  getFirestore,
  limit as qLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  documentId,
  getDocs,
  getDoc
} from "firebase/firestore";

const db = getFirestore(getApp());

// small helpers
const toNum = (v, d = null) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const toUnit = (u) => (typeof u === "string" ? u.trim().toLowerCase() : null); // "km" | "mi"

/**
 * Shape the payload exactly as your DB expects.
 * Also adds timestamps and an optional GeoPoint for geo queries.
 */
export function normalizeZone(input = {}) {
  const company_name = String(input.company_name ?? "").trim();
  const company_Id = String(input.company_Id ?? "").trim();
  const zone_name = String(input.zone_name ?? input.name ?? "").trim();
  const address = String(input.address ?? input.location ?? "").trim();
  const lat = toNum(input.lat ?? input.center?.lat);
  const lng = toNum(input.lng ?? input.center?.lng);
  const status = toNum(input.status ?? input.status) ?? 1;
  const radius_value = toNum(
    input.radius_value ?? input.radiusValue,
    0
  );
  const radius_unit = toUnit(input.radius_unit ?? input.radiusUnit); // "km" | "mi"

  if (!zone_name) throw new Error("zone_name is required");
  if (lat == null || lng == null) throw new Error("lat/lng are required");
  if (!radius_unit || !["km", "mi"].includes(radius_unit))
    throw new Error("radius_unit must be 'km' or 'mi'");

  const payload = {
    company_name,
    zone_name,
    address,
    lat,
    lng,
    status,
    radius_value,
    radius_unit,
    company_Id,
    radius_meters:
      radius_unit === "km"
        ? radius_value * 1000
        : radius_value * 1609.34,
    geopoint: new GeoPoint(lat, lng), // helpful for geo queries
    updatedAt: serverTimestamp(),
  };

  // createdAt will be set only on create
  return payload;
}

export async function createZone(input) {
  const payload = normalizeZone(input);

  const ref = await addDoc(collection(db, "zones"), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateZone(id, input) {
  const payload = normalizeZone(input);
  await updateDoc(doc(db, "zones", id), payload);
  return id;
}
// small helper for IN queries (chunk to 10 ids)
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function listIssues(params, onData, onError, cursor = null) {

  const colRef = collection(getFirestore(), "observations");
  const constraints = [];

  if (params.company_id) {
    constraints.push(where("companyId", "==", params.company_id));
  }

  const hasSearch = !!(params.search && params.search.trim());
  if (hasSearch) {
    const s = params.search.trim();
    constraints.push(orderBy("address", "asc"));
    constraints.push(where("address", ">=", s));
    constraints.push(where("address", "<=", s + "\uf8ff"));
  } else {
    constraints.push(orderBy("createdAt", "desc"));
  }

  if (cursor) constraints.push(startAfter(cursor));
  if (params.limitBy) constraints.push(qLimit(params.limitBy));



  const q = query(colRef, ...constraints);
  const qRef = query(colRef, ...constraints);

  return onSnapshot(
    qRef,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;

      (async () => {
        const getAgentId = (o) => o.userId ?? o.agentId;
        const ids = Array.from(
          new Set(
            rows
              .map(getAgentId)
              .filter((v) => typeof v === "string" && v.trim() !== "")
          )
        );

        if (!ids.length) {
          onData(rows, nextCursor);
          return;
        }

        const agentsRef = collection(db, "agents");
        const agentsMap = {};

        const chunks = chunk(ids, 10);
        for (const c of chunks) {
          const aq = query(agentsRef, where(documentId(), "in", c));
          const asnap = await getDocs(aq);
          asnap.forEach((ad) => {
            agentsMap[ad.id] = { id: ad.id, ...ad.data() };
          });
        }

        const merged = rows.map((o) => {
          const aid = getAgentId(o);
          const agent = aid ? agentsMap[aid] ?? null : null;

          return {
            ...o,
            agent,                              // full agent object
            agentName: agent?.agent_name ?? null,     // convenience field
          };
        });

        onData(merged, nextCursor);
      })().catch((e) => {
        if (onError) onError(e);
        else console.error("Hydrating agents failed:", e);
        onData(rows, nextCursor);
      });
    },
    (err) => (onError ? onError(err) : console.error("Issues listener error:", err))
  );






  // if (params?.unit) filters.push(where("radius_unit", "==", toUnit(params.unit))); // e.g. "km"
  // if (typeof params?.minRadius === "number")
  //   filters.push(where("radius_value", ">=", params.minRadius));
  // filters.push(orderBy("createdAt", "desc"));
  // if (params?.limitBy) filters.push(limit(params.limitBy));
  // const qRef = query(...filters);
  // return onSnapshot(qRef, (snap) =>
  //   cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  // );
}

export function listenObservationById(observationId, onData, onError) {
  const db = getFirestore();
  const ref = doc(db, "observations", observationId);

  return onSnapshot(
    ref,
    async (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }

      const obs = { id: snap.id, ...snap.data() };

      // pick your agent id field here
      const agentId = obs.userId || obs.agentId || null;
      if (!agentId || typeof agentId !== "string") {
        onData(obs);
        return;
      }

      try {
        // get agent document
        const agentRef = doc(db, "agents", agentId);
        const agentSnap = await getDoc(agentRef);

        // if found, add photoUrl (or fallback to other known fields)
        const agent = agentSnap.exists()
          ? {
            id: agentSnap.id,
            ...agentSnap.data(),
            photoUrl:
              agentSnap.data().photoUrl ||
              agentSnap.data().photoURL ||
              agentSnap.data().avatar ||
              agentSnap.data().profilePhoto ||
              agentSnap.data().imageUrl ||
              null,
          }
          : null;
        onData({
          ...obs,
          agent,
        });
      } catch (e) {
        if (onError) onError(e);
        else console.error("Agent lookup failed:", e);
        onData(obs);
      }
    },
    (err) => (onError ? onError(err) : console.error(err))
  );
}