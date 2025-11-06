import { toast } from "react-toastify";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit as qLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  or,
  and,
  deleteDoc
} from "firebase/firestore";
import { getNextSno } from "../utils/firebase-service";

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

  const { sno, unique_id } = await getNextSno(db, 'companies', 'LLP');

  const uid = String(data?.uid ?? data?.id ?? "").trim();

  if (!uid) throw new Error("Missing UID: pass data.uid (or data.id) to use as the company doc id.");
  if (!company_name) throw new Error("Company name is required.");
  if (!email) throw new Error("Company email is required.");

  // 1) Email uniqueness (companies)

  // if (!dup.empty) throw new Error("A company with this email already exists.");

  // 2) UID uniqueness (doc id)
  const companyRef = doc(db, "companies", uid);
  const existing = await getDoc(companyRef);
  if (existing.exists()) throw new Error("A company already exists for this UID.");

  // 3) Create
  await setDoc(
    companyRef,
    {
      unique_id,
      unique_id_lc: unique_id.toLowerCase(),
      sno,
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
      loginCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      phone_number: data?.phone_number,
      last_name: data?.last_name,
      first_name: data?.first_name,
    },
    { merge: false }
  );

  return uid;
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



export function listenCompanies(params, cb) {
  const agentField = params?.agentField || "company_Id";
  const zonesCompanyField = params?.zonesCompanyField || "company_Id";

  const relatedUsesFormattedId = !!params?.relatedUsesFormattedId; // default false
  const formatFromField = params?.formatFromField || null;




  const colRef = collection(db, "companies");
  const constraints = [];

  // filters
  if (typeof params?.status === "number") {
    constraints.push(where("status", "==", params.status));
  }
  if (typeof params?.zone === "number") {
    constraints.push(where("zone", "==", params.zone));
  }

  if (params?.limitBy) constraints.push(qLimit(params.limitBy));

  const qRef = query(colRef, ...constraints);

  // --- live companies, plus per-company agents & zones counts ---
  const agentUnsubsByCompany = new Map();
  const zonesUnsubsByCompany = new Map();
  let companiesById = {};

  const emit = () => cb(Object.values(companiesById));

  const unsubCompanies = onSnapshot(qRef, (snap) => {
    const currentIds = new Set();

    companiesById = {};
    snap.docs.forEach((d) => {
      const id = d.id;

      companiesById[id] = {
        id,
        _snap: d,
        ...d.data(),
        agents: [],
        // agentCount: 0,
        // zonesCount: 0,
      };
      currentIds.add(id);
    });

    // cleanup listeners for companies no longer present
    for (const [companyId, fn] of agentUnsubsByCompany.entries()) {
      if (!currentIds.has(companyId)) { try { fn(); } catch { } agentUnsubsByCompany.delete(companyId); }
    }
    for (const [companyId, fn] of zonesUnsubsByCompany.entries()) {
      if (!currentIds.has(companyId)) { try { fn(); } catch { } zonesUnsubsByCompany.delete(companyId); }
    }

    // wire per-company listeners (agents + zones count)
    for (const companyId of currentIds) {
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

      if (!zonesUnsubsByCompany.has(companyId)) {
        const zonesQ = query(
          collection(db, "zones"),
          where(zonesCompanyField, "==", companyId)
        );
        const unsubZones = onSnapshot(zonesQ, (zoneSnap) => {
          if (companiesById[companyId]) {
            companiesById[companyId].zonesCount = zoneSnap.size;
            emit();
          }
        });
        zonesUnsubsByCompany.set(companyId, unsubZones);
      }
    }

    emit();
  });

  // single unsubscribe
  return () => {
    try { unsubCompanies(); } catch { }
    for (const fn of agentUnsubsByCompany.values()) { try { fn(); } catch { } }
    for (const fn of zonesUnsubsByCompany.values()) { try { fn(); } catch { } }
    agentUnsubsByCompany.clear();
    zonesUnsubsByCompany.clear();
  };
}

// Helper: turn a numeric/string id into "LLP000001"
// function formatCompanyId(value) {
//   // Accept "1", 1, "LLP000001" -> always return "LLP000001"
//   const digits = String(value || "").replace(/\D/g, ""); // strip non-digits
//   if (!digits) return null;
//   return `LLP${digits.padStart(6, "0")}`;
// }

function nonEmptyString(v) {
  return typeof v === "string" && v.trim() !== "";
}
// export function listenCompanies1(params, cb) {

//   console.log(params.search);


//   const agentField = params?.agentField || "company_Id";
//   const zonesCompanyField = params?.zonesCompanyField || "company_Id";
//   const relatedUsesFormattedId = !!params?.relatedUsesFormattedId; // default false

//   const colRef = collection(db, "companies");
//   const constraints = [];

//   if (typeof params?.status === "number") constraints.push(where("status", "==", params.status));


//   if (typeof params?.zone === "number") constraints.push(where("zone", "==", params.zone));
//   if (params?.limitBy) constraints.push(qLimit(params.limitBy));
//   if (nonEmptyString(params?.search)) {
//     const s = params.search.trim().toLowerCase();
//     // company_name_lc OR email equals the search value
//     constraints.push(
//       or(
//         where("company_name_lc", "==", s),
//         where("email", "==", s)
//       )
//     );
//   }


//   const qRef = query(colRef, ...constraints);

//   const agentUnsubsByCompany = new Map();
//   const zonesUnsubsByCompany = new Map();
//   let companiesById = {};

//   const emit = () => cb(Object.values(companiesById));

//   const unsubCompanies = onSnapshot(qRef, (snap) => {
//     const currentIds = new Set();
//     companiesById = {};

//     snap.docs.forEach((d) => {
//       const id = d.id;
//       const data = d.data();

//       // Decide the source value to format:
//       // - If you keep a numeric sequence in the doc (e.g., data.sequence = 1), prefer that
//       // - Else fall back to the doc id (digits inside will be used)
//       // const valueToFormat = formatFromField ? data?.[formatFromField] : id;
//       // // const companyIdFormatted = formatCompanyId(valueToFormat);

//       companiesById[id] = {
//         id,                   // raw Firestore doc id
//         // companyIdFormatted,   // "LLP000001"
//         _snap: d,
//         ...data,
//         agents: [],
//         agentCount: 0,
//         zonesCount: 0,
//       };
//       currentIds.add(id);
//     });

//     // cleanup listeners
//     for (const [companyId, fn] of agentUnsubsByCompany.entries()) {
//       if (!currentIds.has(companyId)) { try { fn(); } catch { } agentUnsubsByCompany.delete(companyId); }
//     }
//     for (const [companyId, fn] of zonesUnsubsByCompany.entries()) {
//       if (!currentIds.has(companyId)) { try { fn(); } catch { } zonesUnsubsByCompany.delete(companyId); }
//     }

//     // wire per-company listeners
//     for (const companyId of currentIds) {
//       const company = companiesById[companyId];
//       const keyForRelated = relatedUsesFormattedId ? company.companyIdFormatted : companyId;

//       if (!agentUnsubsByCompany.has(companyId)) {
//         const agentsQ = query(
//           collection(db, "agents"),
//           where(agentField, "==", keyForRelated)
//         );
//         const unsubAgents = onSnapshot(agentsQ, (agentSnap) => {
//           const agents = agentSnap.docs.map((a) => ({ id: a.id, _snap: a, ...a.data() }));
//           if (companiesById[companyId]) {
//             companiesById[companyId].agents = agents;
//             companiesById[companyId].agentCount = agents.length;
//             emit();
//           }
//         });
//         agentUnsubsByCompany.set(companyId, unsubAgents);
//       }

//       if (!zonesUnsubsByCompany.has(companyId)) {
//         const zonesQ = query(
//           collection(db, "zones"),
//           where(zonesCompanyField, "==", keyForRelated)
//         );
//         const unsubZones = onSnapshot(zonesQ, (zoneSnap) => {
//           if (companiesById[companyId]) {
//             companiesById[companyId].zonesCount = zoneSnap.size;
//             emit();
//           }
//         });
//         zonesUnsubsByCompany.set(companyId, unsubZones);
//       }
//     }

//     emit();
//   });

//   return () => {
//     try { unsubCompanies(); } catch {
//       console.error('Some error')
//     }
//     for (const fn of agentUnsubsByCompany.values()) {
//       try { fn(); } catch {
//         console.error('Some error')
//       }
//     }
//     for (const fn of zonesUnsubsByCompany.values()) {
//       try { fn(); } catch {
//         console.error('Some error')
//       }
//     }
//     agentUnsubsByCompany.clear();
//     zonesUnsubsByCompany.clear();
//   };
// }


/**
 * Listen to the companies collection with dynamic filters.
 */
export function listenCompanies1(params, cb) {
  const agentField = params?.agentField || "company_Id";
  const zonesCompanyField = params?.zonesCompanyField || "company_Id";
  const relatedUsesFormattedId = !!params?.relatedUsesFormattedId;

  const colRef = collection(db, "companies");

  const filters = [];
  let queryConstraints = [];

  // Add filters
  if (typeof params?.status === "number") {
    filters.push(where("status", "==", params.status));
  }

  if (typeof params?.zone === "number") {
    filters.push(where("zone", "==", params.zone));
  }

  if (nonEmptyString(params?.search)) {
    const s = params.search.trim().toLowerCase();

    // Partial match (prefix search on multiple fields)
    filters.push(
      or(
        and(
          where("company_name_lc", ">=", s),
          where("company_name_lc", "<", s + "\uf8ff")
        ),
        and(
          where("unique_id_lc", ">=", s),
          where("unique_id_lc", "<", s + "\uf8ff")
        ),
        and(
          where("email_lc", ">=", s),
          where("email_lc", "<", s + "\uf8ff")
        )
      )
    );

  }

  // ✅ Build main query correctly
  if (filters.length === 1) {
    queryConstraints.push(filters[0]);
  } else if (filters.length > 1) {
    queryConstraints.push(and(...filters));
  }

  // Add limit *after* the filter
  if (params?.limitBy) {
    queryConstraints.push(qLimit(params.limitBy));
  }

  const qRef = query(colRef, ...queryConstraints);

  // --- Snapshot + subcollection logic ---
  const agentUnsubsByCompany = new Map();
  const zonesUnsubsByCompany = new Map();
  let companiesById = {};

  const emit = () => cb(Object.values(companiesById));

  const unsubCompanies = onSnapshot(qRef, (snap) => {
    const currentIds = new Set();
    companiesById = {};

    snap.docs.forEach((d) => {
      const id = d.id;
      const data = d.data();

      companiesById[id] = {
        id,
        _snap: d,
        ...data,
        agents: [],
        agentCount: 0,
        zonesCount: 0,
      };

      currentIds.add(id);
    });

    // cleanup removed listeners
    for (const [companyId, fn] of agentUnsubsByCompany.entries()) {
      if (!currentIds.has(companyId)) {
        try { fn(); } catch { }
        agentUnsubsByCompany.delete(companyId);
      }
    }

    for (const [companyId, fn] of zonesUnsubsByCompany.entries()) {
      if (!currentIds.has(companyId)) {
        try { fn(); } catch { }
        zonesUnsubsByCompany.delete(companyId);
      }
    }

    // wire per-company listeners
    for (const companyId of currentIds) {
      const company = companiesById[companyId];
      const keyForRelated = relatedUsesFormattedId ? company.companyIdFormatted : companyId;

      // Agents
      if (!agentUnsubsByCompany.has(companyId)) {
        const agentsQ = query(
          collection(db, "agents"),
          where(agentField, "==", keyForRelated)
        );
        const unsubAgents = onSnapshot(agentsQ, (agentSnap) => {
          const agents = agentSnap.docs.map((a) => ({
            id: a.id,
            _snap: a,
            ...a.data(),
          }));
          if (companiesById[companyId]) {
            companiesById[companyId].agents = agents;
            companiesById[companyId].agentCount = agents.length;
            emit();
          }
        });
        agentUnsubsByCompany.set(companyId, unsubAgents);
      }

      // Zones
      if (!zonesUnsubsByCompany.has(companyId)) {
        const zonesQ = query(
          collection(db, "zones"),
          where(zonesCompanyField, "==", keyForRelated)
        );
        const unsubZones = onSnapshot(zonesQ, (zoneSnap) => {
          if (companiesById[companyId]) {
            companiesById[companyId].zonesCount = zoneSnap.size;
            emit();
          }
        });
        zonesUnsubsByCompany.set(companyId, unsubZones);
      }
    }

    emit();
  });

  // cleanup function
  return () => {
    try { unsubCompanies(); } catch { }
    for (const fn of agentUnsubsByCompany.values()) {
      try { fn(); } catch { }
    }
    for (const fn of zonesUnsubsByCompany.values()) {
      try { fn(); } catch { }
    }
    agentUnsubsByCompany.clear();
    zonesUnsubsByCompany.clear();
  };
}


export async function deleteCompany(companyId) {
  try {
    await deleteDoc(doc(db, "companies", companyId));

    const url = "https://leadfirepro.net/api/delete-user";
    const emailRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: companyId }),
    });
    toast.success("Company delete successfully!");
    return { ok: true, message: `Company ${companyId} deleted successfully`, auth: emailRes };
  } catch (err) {
    toast.error(err.message);
    console.error("Error deleting company:", err);
    return { ok: false, error: err.message };
  }
}