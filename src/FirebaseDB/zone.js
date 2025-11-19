// src/FirebaseDB/zones.js
import { getApp } from "firebase/app";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  endAt,
  GeoPoint,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  limit as qLimit,
  query,
  serverTimestamp,
  startAfter,
  startAt,
  updateDoc,
  where
} from "firebase/firestore";
import { getNextSno } from "../utils/firebase-service";
import { updateAgent } from "./agent";
import { updateCompanyAgentCount } from "./companies";

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
  const agent_id = input.agent_id;
  const company_Id = String(input.company_Id ?? "").trim();
  const zone_name = String(input.zone_name ?? input.name ?? "").trim();
  const zone_name_lc = input?.zone_name.toLowerCase()
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
    zone_name_lc,
    agent_id,
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
  const { sno, unique_id } = await getNextSno(db, "zones", "Z");

  const ref = await addDoc(collection(db, "zones"), {
    ...payload,
    unique_id,
    sno,
    assigned_status: payload.agent_id ? 1 : 2,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const zoneId = ref.id;

  if (payload.agent_id) {
    await addZoneToAgent(payload.agent_id, zoneId);
    await updateCompanyAgentCount(payload.company_Id);
  }

  return zoneId;
}

export async function updateZone(id, input) {
  const payload = normalizeZone(input);

  await updateDoc(doc(db, "zones", id), {
    ...payload,
    assigned_status: payload.agent_id ? 1 : 2,
    updatedAt: serverTimestamp(),
  });

  if (payload.agent_id) {
    await addZoneToAgent(payload.agent_id, id);
    await updateCompanyAgentCount(payload.company_Id);
  }

  return id;
}

async function addZoneToAgent(agentId, zoneId) {
  if (!agentId || !zoneId) return;

  if (Array.isArray(agentId)) {
    for (const single of agentId) {
      await addZoneToSingleAgent(single, zoneId);
    }
  } else {
    await addZoneToSingleAgent(agentId, zoneId);
  }
}

async function addZoneToSingleAgent(agentValue, zoneId) {
  let docId = agentValue;

  if (typeof agentValue === "object" && agentValue !== null) {
    docId =
      agentValue.id ||
      agentValue.docId ||
      agentValue.value ||
      null;
  }

  if (typeof docId !== "string") {
    console.error("Invalid agentId passed to addZoneToAgent:", agentValue);
    return;
  }

  const agentRef = doc(db, "agents", docId);
  const snap = await getDoc(agentRef);

  if (!snap.exists()) {
    console.warn("Agent not found for id:", docId);
    return;
  }

  await updateDoc(agentRef, {
    zone: arrayUnion(zoneId),
    updatedAt: serverTimestamp(),
  });
}

export function listZones(params, onData, onError, cursor = null) {
  const db = getFirestore();
  const colRef = collection(db, "zones");
  const constraints = [];

  // filters
  if (params?.company_id) constraints.push(where("company_Id", "==", params.company_id));
  if (typeof params?.status === "number") constraints.push(where("status", "==", params.status));
  if (typeof params?.assigned_status === "number") constraints.push(where("assigned_status", "==", params.assigned_status));

  // search / sort
  const hasSearch = !!(params?.search && params.search.trim());
  // if (hasSearch) {
  //   const s = params.search.trim().toLowerCase();


  //   const qName = query(
  //     colRef,
  //     ...base,
  //     orderBy("zone_name_lc"),
  //     startAt(s),
  //     endAt(s + "\uf8ff"),
  //     ...lim
  //   );

  //   constraints.push(orderBy("search_blob", "asc"));
  //   constraints.push(where("search_blob", ">=", s));
  //   constraints.push(where("search_blob", "<=", s + "\uf8ff"));
  // } else {
  //   constraints.push(orderBy("createdAt", "desc"));
  // }


  if (hasSearch) {
    const s = params.search.trim().toLowerCase();

    // ✅ Search by zone_name_lc (prefix match)
    constraints.push(orderBy("zone_name_lc"));
    constraints.push(startAt(s));
    constraints.push(endAt(s + "\uf8ff"));
  } else {
    // ✅ Default sort when no search
    constraints.push(orderBy("createdAt", "desc"));
  }




  if (cursor) constraints.push(startAfter(cursor));
  if (params?.limitBy) constraints.push(qLimit(params.limitBy));

  const q = query(colRef, ...constraints);

  // --- join helpers: company listeners + cache (unchanged) ---
  const companyUnsubs = new Map();
  const companyCache = new Map();
  let zones = [];

  const emit = () => {
    const rows = zones.map((z) => ({
      ...z,
      // you already store company_name in the zone doc; if you still want live joins, keep this:
      company_name: companyCache.get(z.company_Id)?.company_name ?? z.company_name ?? null,
    }));
    const nextCursor = zones.length ? zones[zones.length - 1]._snap : null;
    onData(rows, nextCursor);
  };

  const unsubZones = onSnapshot(
    q,
    (snap) => {
      zones = snap.docs.map((d) => ({ id: d.id, _snap: d, ...d.data() }));

      // live company-name join (optional if you trust the denormalized company_name)
      const needed = new Set(zones.map((z) => z.company_Id).filter(Boolean));
      for (const [cid, fn] of companyUnsubs.entries()) {
        if (!needed.has(cid)) { try { fn(); } catch { } companyUnsubs.delete(cid); companyCache.delete(cid); }
      }
      for (const cid of needed) {
        if (!companyUnsubs.has(cid)) {
          const ref = doc(db, "companies", cid);
          const unsubCompany = onSnapshot(
            ref,
            (cSnap) => { cSnap.exists() ? companyCache.set(cid, cSnap.data()) : companyCache.delete(cid); emit(); },
            (err) => console.error("Company join error:", err)
          );
          companyUnsubs.set(cid, unsubCompany);
        }
      }

      emit();
    },
    (err) => (onError ? onError(err) : console.error("Zones listener error:", err))
  );

  return () => {
    try { unsubZones(); } catch { }
    for (const fn of companyUnsubs.values()) { try { fn(); } catch { } }
    companyUnsubs.clear();
    companyCache.clear();
  };
}


// ************************************************************************************
export async function updateZoneStatus(prams) {
  // console.log('zoneId', zoneId);
  // console.log('nextStatus', nextStatus);


  // Only update the fields you want to change
  await updateDoc(doc(db, "zones", prams?.id), {
    status: prams?.nextStatus,
    updatedAt: serverTimestamp(), // optional, but useful
  });
}


// ************************************************************************************


export function getZoneById(zoneId, onData, onError) {
  if (!zoneId) throw new Error("zoneId is required");

  const ref = doc(getFirestore() || db, "zones", zoneId);

  // Realtime updates
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        // onData(null); // zone not found
        return;
      }
      return { id: snap.id, ...snap.data() }
    },
    (err) => (onError ? onError(err) : console.error("Zone listener error:", err))
  );
}
