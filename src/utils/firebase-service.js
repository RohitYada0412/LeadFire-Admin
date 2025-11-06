import {
  collection,
  getDocs,
  orderBy,
  limit as qLimit,
  query
} from "firebase/firestore";

export async function getNextSno(
  db,
  collectionName,
  startName = "",   // prefix for unique_id, e.g. "CMP"
  width = 5,        // zero-pad width: 5 -> 00000..99999
  startAt = 1      // first number to use when empty: 0 -> "00000"
) {
  const pad = (n) => String(n).padStart(width, "0");

  const q = query(
    collection(db, collectionName),
    orderBy("sno", "desc"), // sno must be fixed-width strings
    qLimit(1)
  );

  const snap = await getDocs(q);

  let nextNum;

  if (snap.empty) {
    nextNum = startAt;                   // e.g., 0 -> "00000"
  } else {
    const last = snap.docs[0].data().sno;              // e.g., "00042"
    const parsed = Number.parseInt(String(last), 10);
    nextNum = Number.isFinite(parsed) ? parsed + 1 : startAt;
  }

  const sno = pad(nextNum);              // e.g., "00043"
  const unique_id = `${startName}${sno}`; // e.g., "CMP00043"

  return { sno, unique_id, number: nextNum };
}