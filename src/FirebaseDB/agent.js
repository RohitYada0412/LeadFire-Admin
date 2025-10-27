// src/FirebaseDB/agents.js
import { getApp } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  // limit,
  onSnapshot,
  orderBy,
  limit as qLimit,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

import { updateCompanyAgentCount } from "./companies";

const app = getApp();
const db = getFirestore(app);
const storage = getStorage(app);

// Fix: make isFileLike return a boolean
const isFileLike = (f) =>
  !!f &&
  typeof f === "object" &&
  (typeof Blob === "undefined" ? ("size" in f && "type" in f) : f instanceof Blob);

const pickExt = (file) => {
  const byName = file?.name?.split(".").pop();
  if (byName) return byName.toLowerCase();
  const map = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
  return map[file?.type] || "jpg";
};

/** Create agent with provided UID as doc id and update company count */
export async function createAgent(data) {
  const agent_name = String(data?.agent_name ?? "").trim();
  const email = String(data?.email ?? "").trim().toLowerCase();
  const uid = String(data?.id ?? data?.uid ?? "").trim(); // <- UID becomes doc ID

  if (!uid) throw new Error("UID is required.");
  if (!agent_name) throw new Error("Agent name is required.");
  if (!email) throw new Error("Email is required.");

  // 1) Ensure no other agent uses this email
  const dup = await getDocs(query(collection(db, "agents"), where("email_lc", "==", email), limit(1)));
  if (!dup.empty) throw new Error("An agent with this email already exists.");

  // 2) Ensure no existing doc with same uid
  const agentRef = doc(db, "agents", uid);
  const existing = await getDoc(agentRef);
  if (existing.exists()) throw new Error("An agent already exists for this UID.");

  // 3) Build payload
  const payload = {
    id: uid,
    agent_name,
    email,
    agent_name_lc: agent_name.toLowerCase(),
    email_lc: email,
    status: Number(data?.status) || 1,
    zone: data?.zone || [],
    agents: Number(data?.agents) || 0,
    company_Id: data?.company_id ?? null,
    user_name: data?.user_name ?? null,
    user_type: data?.user_type ?? null,
    temp_password: data?.temp_password ?? null,
    password: "",
    photoURL: null,
    photoPath: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // 4) Write
  await setDoc(agentRef, payload);

  // 5) Upload photo (optional)
  if (isFileLike(data?.photo)) {
    try {
      const ext = pickExt(data.photo);
      const path = `agents/${uid}/avatar_${Date.now()}.${ext}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, data.photo, {
        contentType: data.photo.type || `image/${ext}`,
      });
      const url = await getDownloadURL(fileRef);
      await updateDoc(agentRef, {
        photoURL: url,
        photoPath: path,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      const msg = (e && e.code === "storage/unauthorized")
        ? "You don't have permission to upload to Storage. Are you signed in and do your rules allow write to agents/*?"
        : (e?.message || "Failed to upload photo");
      throw new Error(msg);
    }
  }

  // 6) Update company count
  if (payload.company_Id) {
    await updateCompanyAgentCount(payload.company_Id);
  }

  return uid;
}

/** Update agent and keep company counts consistent */
export async function updateAgent(agentId, data) {
  if (!agentId) throw new Error("agentId is required.");

  // Fetch "before" to detect company change
  const agentRef = doc(db, "agents", String(agentId));
  const beforeSnap = await getDoc(agentRef);
  const beforeData = beforeSnap.exists() ? beforeSnap.data() : {};

  if (data?.email) {
    const emailLc = String(data.email).trim().toLowerCase();
    const res = await getDocs(query(collection(db, "agents"), where("email_lc", "==", emailLc)));
    const duplicate = res.docs.find((d) => d.id !== agentId);
    if (duplicate) throw new Error("Another agent already uses this email.");
  }

  const patch = {
    ...(data?.agent_name != null && {
      agent_name: data.agent_name,
      agent_name_lc: String(data.agent_name).trim().toLowerCase(),
    }),
    ...(data?.email != null && {
      email: data.email,
      email_lc: String(data.email).trim().toLowerCase(),
    }),
    ...(data?.status != null && { status: Number(data.status) }),
    ...(data?.zone != null && { zone: Array.isArray(data.zone) ? data.zone : [data.zone] }),
    ...(data?.agents != null && { agents: Number(data.agents) }),
    ...(data?.company_id !== undefined && { company_Id: data.company_id }),
    ...(data?.user_name !== undefined && { user_name: data.user_name }),
    ...(data?.user_type !== undefined && { user_type: data.user_type }),
    ...(data?.temp_password !== undefined && { temp_password: data.temp_password }),
    updatedAt: serverTimestamp(),
  };

  // handle photo
  if (isFileLike(data?.photo)) {
    const ext = pickExt(data.photo);
    const path = `agents/${agentId}/avatar_${Date.now()}.${ext}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, data.photo, { contentType: data.photo.type || `image/${ext}` });
    const url = await getDownloadURL(fileRef);
    patch.photoURL = url;
    patch.photoPath = path;

    if (data?.oldPhotoPath) {
      try { await deleteObject(ref(storage, data.oldPhotoPath)); } catch (err) {
        console.log("delete old photo error:", err);
      }
    }
  }

  await updateDoc(agentRef, patch);

  // Refresh counts if company changed (or if company provided)
  const prevCompany = beforeData?.company_Id ?? null;
  const nextCompany = (data?.company_id !== undefined) ? data.company_id : prevCompany;

  if (prevCompany !== nextCompany) {
    if (prevCompany) await updateCompanyAgentCount(prevCompany);
    if (nextCompany) await updateCompanyAgentCount(nextCompany);
  } else if (nextCompany) {
    // Optional: recalc even if unchanged (safe no-op)
    await updateCompanyAgentCount(nextCompany);
  }
}

/** Delete agent and update company count */
export async function deleteAgent(agentId) {
  if (!agentId) throw new Error("agentId is required.");

  const refDoc = doc(db, "agents", String(agentId));
  const snap = await getDoc(refDoc);
  const companyId = snap.exists() ? snap.data()?.company_Id : null;

  await deleteDoc(refDoc);

  if (companyId) {
    await updateCompanyAgentCount(companyId);
  }
}

export function listAgents(params = {},  onData, onError,cursor = null,) {
  const colRef = collection(getFirestore() || db, "agents");
  const constraints = [];

  if (params.company_id) {
    constraints.push(where("company_Id", "==", params.company_id));
  }

  // // status filter
  if (typeof params.status === "number") {
    constraints.push(where("status", "==", params.status));
  }

  // // zone filter (array)
  if (Array.isArray(params.zone) && params.zone.length > 0) {
    constraints.push(where("zone", "in", [params.zone.slice(0, 10)]));
  }

  // // Basic text search (prefix) — pick one field to index/order.
  // // Here we use nameLower primarily, and fall back to emailLower if you want a second query (see alt below).
  // // Firestore requires range filters to match the same orderBy field.
  let didApplySearch = false;
  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    constraints.push(where("agent_name", ">=", s));
    constraints.push(where("agent_name", "<=", s + "\uf8ff"));
    constraints.push(orderBy("agent_name", "asc"));
    didApplySearch = true
  }
  // // // If no search ordering applied, set a default order for stable pagination
  if (!didApplySearch) {
    constraints.push(orderBy("createdAt", "desc"));
  }


  // Limit
  if (params.limitBy) {
    constraints.push(qLimit(params.limitBy));
  }

  if (cursor != null) {
    constraints.push(startAfter(cursor));
  }
  const q = query(colRef, ...constraints);

  return onSnapshot(
    q,
    (snap) => {

      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;     
      onData(rows, nextCursor);
    },
    (err) => {
      if (onError) onError(err);
      else console.error("Agents listener error:", err);
    }
  );
}


