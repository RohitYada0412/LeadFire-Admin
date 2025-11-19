// src/services/userContext.js
import { getApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  collection,
  doc, getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { auth } from "../firebase";

/**
 * Normalizes role values coming from Firestore (string or legacy number).
 */
const norm = (r) =>
  typeof r === "string" ? r.toLowerCase()
    : r === 1 ? "admin"
      : r === 2 ? "company"
        : r === 3 ? "agent"
          : "unknown";

/**
 * Reads users/{uid} and returns { role, profile }
 */
export async function resolveUserContext({ uid }) {
  const db = getFirestore(getApp());
  const usnap = await getDoc(doc(db, "users", uid));
  if (!usnap.exists()) return { role: "company", profile: null };
  const data = usnap.data();
  const role = norm(data.role ?? data.user_type);
  return { role, profile: { id: usnap.id, ...data, role } };
}

/**
 * Creates users/{uid} ONLY if the email exists in the selected table.
 * Tables:
 *   - admins  (or ADMIN_EMAILS whitelist below)
 *   - companies
 *   - agents
 * Throws if not found.
 */
export async function ensureUserProfile({ uid, email, expectedRole }) {
  const db = getFirestore(getApp());
  const email_lc = (email || "").toLowerCase();

  const uref = doc(db, "users", uid);
  const usnap = await getDoc(uref);
  if (usnap.exists()) return uref; // already provisioned

  const findIn = async (col) => {
    const snap = await getDocs(
      query(collection(db, col), where("email_lc", "==", email_lc), limit(1))
    );
    return snap.empty ? null : snap.docs[0];
  };

  // --- Admin lookup: collection AND/OR whitelist ---
  const ADMIN_EMAILS = ["admin@leadfire.com"]; // optional fallback whitelist

  if (expectedRole === "admin") {
    // Try admins collection first
    let adminDoc = await findIn("admins");
    // If no admins collection doc, allow whitelist as a fallback
    if (!adminDoc && !ADMIN_EMAILS.includes(email_lc)) {
      throw new Error("No admin profile found for this email.");
    }
    await setDoc(
      uref,
      {
        role: "admin",
        email_lc,
        ...(adminDoc ? { admin_id: adminDoc.id } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return uref;
  }

  if (expectedRole === "company") {
    const companyDoc = await findIn("companies");
    if (!companyDoc) throw new Error("No company profile found for this email.");
    await setDoc(
      uref,
      {
        role: "company",
        email_lc,
        company_id: companyDoc.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return uref;
  }

  if (expectedRole === "agent") {
    const agentDoc = await findIn("agents");
    if (!agentDoc) throw new Error("No agent profile found for this email.");
    await setDoc(
      uref,
      {
        role: "agent",
        email_lc,
        agent_id: agentDoc.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return uref;
  }

  throw new Error("Unsupported role selected.");
}

/**
 * Sign up helper (if you use a dedicated sign-up screen)
 */
export async function signUpWithRole({ email, password }) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return user;
}

/**
 * Self-serve account deletion (reauth + delete)
 */
export async function deleteOwnAccount(email, password) {
  const user = auth.currentUser;
  if (!user) throw new Error("No signed-in user.");
  const cred = EmailAuthProvider.credential(email, password);
  await reauthenticateWithCredential(user, cred);
  await deleteUser(user);
}
