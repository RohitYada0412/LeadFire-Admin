// src/data/agents.js
export const agents = [
  {
    id: 'AG001',
    name: 'John Doe',
    email: 'john.smith@leadfire.com',
    zone: 'Zone name',
    issues: 26,
    dateJoined: '2023-12-15',
    status: 'Active',
    avatar: 'https://i.pravatar.cc/48?img=11',
  },
  {
    id: 'AG002',
    name: 'John Doe',
    email: 'sarah.johnson@leadfire.com',
    zone: 'Zone name',
    issues: 14,
    dateJoined: '2023-12-15',
    status: 'Inactive',
    avatar: 'https://i.pravatar.cc/48?img=32',
  },
  {
    id: 'AG003',
    name: 'John Doe',
    email: 'john.smith@leadfire.com',
    zone: 'Zone name',
    issues: 26,
    dateJoined: '2023-12-15',
    status: 'Active',
    avatar: 'https://i.pravatar.cc/48?img=34',
  },
  {
    id: 'AG004',
    name: 'John Doe',
    email: 'sarah.johnson@leadfire.com',
    zone: 'Zone name',
    issues: 14,
    dateJoined: '2023-12-15',
    status: 'Inactive',
    avatar: 'https://i.pravatar.cc/48?img=15',
  },
  {
    id: 'AG005',
    name: 'John Doe',
    email: 'john.smith@leadfire.com',
    zone: 'Zone name',
    issues: 21,
    dateJoined: '2023-12-15',
    status: 'Active',
    avatar: 'https://i.pravatar.cc/48?img=51',
  },
  {
    id: 'AG006',
    name: 'John Doe',
    email: 'sarah.johnson@leadfire.com',
    zone: 'Zone name',
    issues: 19,
    dateJoined: '2023-12-15',
    status: 'Inactive',
    avatar: 'https://i.pravatar.cc/48?img=4',
  },
]

// utils/time.js
export function tsToDate(ts) {
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate();       // Firestore Timestamp instance
  if (typeof ts.seconds === "number") {
    return new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6));
  }
  if (typeof ts === "number" || typeof ts === "string") return new Date(ts);
  return null;
}

export function formatTimestamp(ts, opts = { dateStyle: "medium", timeStyle: "short" }) {
  const d = tsToDate(ts);
  if (!d || isNaN(d)) return "-";
  return new Intl.DateTimeFormat(undefined, opts).format(d); // formats in the user's locale/timezone
}

export function toLc(s = "") {
  return s.toLowerCase().normalize("NFKD").replace(/\p{Diacritic}/gu, "");
}
export function reverseString(s = "") { return [...s].reverse().join(""); }

export function gramsForQuery(termLc) {
  const grams = new Set();
  for (let i = 0; i <= termLc.length - 2; i++) grams.add(termLc.slice(i, i + 2));
  for (let i = 0; i <= termLc.length - 3; i++) grams.add(termLc.slice(i, i + 3));
  // Firestore array-contains-any max 30 values
  return Array.from(grams).slice(0, 30);
}








// export function listAgents(params = {}, cb) {
//   const constraints = [];
//   if (params.company_Id) constraints.push(where("company_Id", "==", params.company_Id));
//   if (params.status) constraints.push(where("status", "==", params.status));
//   if (typeof params.zone === "number") constraints.push(where("zone", "==", params.zone));

//   const raw = typeof params.search === "string" ? params.search.trim() : "";
//   const term = toLc(raw);
//   const mode = params.mode ?? "prefix";

//   if (term) {
//     if (mode === "prefix") {
//       constraints.push(where("agent_name_lc", ">=", term));
//       constraints.push(where("agent_name_lc", "<", term + "\uf8ff"));
//       constraints.push(orderBy("agent_name_lc"));
//     } else if (mode === "suffix") {
//       const rt = reverseString(term);
//       constraints.push(where("agent_name_rev", ">=", rt));
//       constraints.push(where("agent_name_rev", "<", rt + "\uf8ff"));
//       constraints.push(orderBy("agent_name_rev"));
//     } else {
//       // substring (approximate): grams OR-match
//       const grams = gramsForQuery(term);
//       if (grams.length > 0) constraints.push(where("searchGrams", "array-contains-any", grams));
//       // sort by name or recency as you prefer
//       constraints.push(orderBy("agent_name_lc"));
//     }
//   } else {
//     constraints.push(orderBy("createdAt", "desc"));
//   }

//   if (typeof params.limitBy === "number" && params.limitBy > 0) {
//     constraints.push(limit(params.limitBy));
//   }

//   const qRef = query(collection(db, "agents"), ...constraints);

//   return onSnapshot(qRef, (snap) => {
//     let rows = snap.docs.map((d) => ({ id: d.id, _snap: d, ...d.data() }));

//     // Post-filter to ensure strict substring match when mode === "substring"
//     if (term && (params.mode ?? "prefix") === "substring") {
//       rows = rows.filter(r => (r.agent_name_lc ?? "").includes(term));
//     }

//     if (typeof cb === "function") cb(rows);
//   });
// }