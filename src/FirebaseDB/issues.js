// src/FirebaseDB/zones.js
import { getApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  GeoPoint,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
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
  const status = toNum(input.status ?? input.status)??1;
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

/** Live list with optional filters */
export function listIssues(params, cb) {
  const filters = [collection(db, "observations")];
  if (params?.unit) filters.push(where("radius_unit", "==", toUnit(params.unit))); // e.g. "km"
  if (typeof params?.minRadius === "number")
    filters.push(where("radius_value", ">=", params.minRadius));
  filters.push(orderBy("createdAt", "desc"));
  if (params?.limitBy) filters.push(limit(params.limitBy));
  const qRef = query(...filters);
  return onSnapshot(qRef, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}
