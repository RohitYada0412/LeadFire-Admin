// src/FirebaseDB/companies.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where
} from "firebase/firestore";

const db = getFirestore();

/** ─────────────────────────────────────────────────────────────
 * Recalculate & update the number of agents belonging to a company
 * (called by agents.js on create/update/delete).
 * ──────────────────────────────────────────────────────────── */
export async function updateCompanyAgentCount(companyId) {
  if (!companyId) return;

  // all agents belonging to this company
  const q = query(collection(db, "agents"), where("company_Id", "==", companyId));
  const snap = await getDocs(q);

  console.log('snap',snap);
  

  const agentTotal = snap.size;
  const zoneCount = {}; // { [zoneId]: count }

  snap.forEach((docSnap) => {
    const d = docSnap.data() || {};

    // normalize to an array of zone ids (handles string, number, array, or missing)
    const zones = Array.isArray(d.zone)
      ? d.zone
      : d.zone != null
      ? [d.zone]
      : [];

    zones
      .map((z) => String(z).trim())
      .filter(Boolean)
      .forEach((zoneId) => {
        zoneCount[zoneId] = (zoneCount[zoneId] || 0) + 1;
      });
  });
  

  await updateDoc(doc(db, "companies", companyId), {
    agent_count: agentTotal,
    zone_count: zoneCount,          // <-- per-zone map, not a single number
    updatedAt: serverTimestamp(),
  });
}


/** Create company with provided UID as doc id */
export async function createCompany(data) {
  const company_name = String(data?.company_name || "").trim();
  const email = String(data?.email || "").trim().toLowerCase();
  const uid = String(data?.uid ?? data?.id ?? "").trim();

  if (!uid) throw new Error("Missing UID: pass data.uid (or data.id) to use as the company doc id.");
  if (!company_name) throw new Error("Company name is required.");
  if (!email) throw new Error("Company email is required.");

  // 1) Email uniqueness (companies)
  const dup = await getDocs(
    query(collection(db, "companies"), where("email_lc", "==", email), limit(1))
  );
  if (!dup.empty) throw new Error("A company with this email already exists.");

  // 2) UID uniqueness (doc id)
  const companyRef = doc(db, "companies", uid);
  const existing = await getDoc(companyRef);
  if (existing.exists()) throw new Error("A company already exists for this UID.");

  // 3) Create
  await setDoc(
    companyRef,
    {
      company_name,
      email,
      company_name_lc: company_name.toLowerCase(),
      email_lc: email,

      status: Number(data?.status) || 1,
      zone: data?.zone ?? [],
      agents: data?.agents ?? [],     // if you keep this array for something else
      agent_count: 0,                 // initialize counter
      displayId: data?.displayId ?? null,
      user_name: data?.user_name ?? null,
      user_type: data?.user_type ?? "company",
      temp_password: data?.temp_password ?? null,
      loginCount:0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: false }
  );

  return uid;
}

export function listenCompanies(params, cb) {
  const agentField = params?.agentField || "company_Id";
  const zonesCompanyField = params?.zonesCompanyField || "company_Id";

  // build companies query (same as your original)
  const parts = [collection(db, "companies")];
  if (params?.status) parts.push(where("status", "==", params.status));
  if (typeof params?.zone === "number") parts.push(where("zone", "==", params.zone));
  parts.push(orderBy("createdAt", "desc"));
  if (params?.limitBy) parts.push(limit(params.limitBy));
  const qRef = query(...parts);

  // track per-company listeners + latest data
  const agentUnsubsByCompany = new Map();
  const zonesUnsubsByCompany = new Map();
  let companiesById = {};

  const emit = () => cb(Object.values(companiesById));

  const unsubCompanies = onSnapshot(qRef, (snap) => {
    const currentIds = new Set();

    // rebuild companies cache from snapshot
    companiesById = {};
    for (const d of snap.docs) {
      const id = d.id;
      companiesById[id] = {
        id,
        _snap: d,
        ...d.data(),
        agents: [],
        agentCount: 0,
        zonesCount: 0,
      };
      currentIds.add(id);
    }

    // stop listeners for companies no longer present
    for (const [companyId, fn] of agentUnsubsByCompany.entries()) {
      if (!currentIds.has(companyId)) {
        try { fn(); } catch {}
        agentUnsubsByCompany.delete(companyId);
      }
    }
    for (const [companyId, fn] of zonesUnsubsByCompany.entries()) {
      if (!currentIds.has(companyId)) {
        try { fn(); } catch {console.log('sadf')}
        zonesUnsubsByCompany.delete(companyId);
      }
    }

    // start/update per-company listeners
    for (const companyId of currentIds) {
      // agents (full docs + count)
      if (!agentUnsubsByCompany.has(companyId)) {
        const agentsQ = query(
          collection(db, "agents"),
          where(agentField, "==", companyId)
        );

        const unsubAgents = onSnapshot(agentsQ, (agentSnap) => {
          const agents = agentSnap.docs.map((a) => ({ id: a.id, _snap: a, ...a.data() }));
          if (companiesById[companyId]) {
            companiesById[companyId].agents = agents;
            companiesById[companyId].agentCount = agents.length;
            emit();
          }
        });

        agentUnsubsByCompany.set(companyId, unsubAgents);
      }

      // zones (count only)
      if (!zonesUnsubsByCompany.has(companyId)) {
        const zonesQ = query(
          collection(db, "zones"),
          where(zonesCompanyField, "==", companyId)
        );

        const unsubZones = onSnapshot(zonesQ, (zoneSnap) => {
          if (companiesById[companyId]) {
            companiesById[companyId].zonesCount = zoneSnap.size; // live count
            emit();
          }
        });

        zonesUnsubsByCompany.set(companyId, unsubZones);
      }
    }

    // emit companies immediately; per-company listeners will update counts/agents
    emit();
  });

  // single unsubscribe that cleans up everything
  return () => {
    try { unsubCompanies(); } catch {console.log('sadf');
    }
    for (const fn of agentUnsubsByCompany.values()) { try { fn(); } catch {console.log('sadf')} }
    for (const fn of zonesUnsubsByCompany.values()) { try { fn(); } catch {console.log('sadf')} }
    agentUnsubsByCompany.clear();
    zonesUnsubsByCompany.clear();
  };
}

/** Default paged list (no search) */
export async function fetchCompaniesPage({ lastDoc = null, pageSize = 25, status, zone } = {}) {
  let qRef = query(collection(db, "companies"));
  if (status) qRef = query(qRef, where("status", "==", status));
  if (typeof zone === "number") qRef = query(qRef, where("zone", "==", zone));
  qRef = query(qRef, orderBy("createdAt", "desc"), limit(pageSize));
  if (lastDoc) qRef = query(qRef, startAfter(lastDoc));

  const snap = await getDocs(qRef);
  return {
    rows: snap.docs.map((d) => ({ id: d.id, _snap: d, ...d.data() })),
    last: snap.docs.at(-1) || null,
  };
}

/** Update */
export async function updateCompany(companyId, patch) {
  await updateDoc(doc(db, "companies", companyId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function getCompanyById(companyId) {
  const ref = doc(db, "companies", companyId);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  console.log("No such company!");
  return null;
}


export async function bumpCompanyLogin(uid, email) {
  const db = getFirestore();

  // 1) If your companies doc id == uid (works if true)
  const byIdRef = doc(db, "companies", uid);
  const byIdSnap = await getDoc(byIdRef);
  if (byIdSnap.exists()) {
    await setDoc(
      byIdRef,
      { loginCount: increment(1), lastLoginAt: serverTimestamp() },
      { merge: true }
    );
    return;
  }

  // 2) Fallback: match by lowercased email field `email_lc`
  if (email) {
    const emailLc = email.toLowerCase();
    const cRef = collection(db, "companies");
    const q = query(cRef, where("email_lc", "==", emailLc));
    const snap = await getDocs(q);

    if (!snap.empty) {
      await Promise.all(
        snap.docs.map((d) =>
          setDoc(
            d.ref,
            { loginCount: increment(1), lastLoginAt: serverTimestamp() },
            { merge: true }
          )
        )
      );
      return;
    }
  }

  // 3) Nothing found — log for debugging
  console.warn("[bumpCompanyLogin] No company doc found for uid/email_lc.", {
    uid,
    email,
  });
}