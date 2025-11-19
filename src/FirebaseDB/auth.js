import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updatePassword
} from "firebase/auth";
import { baseurl } from "../utils/authCall";

import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const db = getFirestore();


// export async function changePassword(newPassword, currentPassword) {
//   const auth = getAuth();
//   const user = auth.currentUser;
//   if (!user) return { ok: false, message: "No signed-in user." };

//   try {
//     await updatePassword(user, newPassword);
//     return { ok: true };
//   } catch (err) {
//     // Requires recent login: let caller know or perform reauth if password provided
//     if (err?.code === "auth/requires-recent-login") {
//       if (!currentPassword) {
//         return {
//           ok: false,
//           needsReauth: true,
//           message: "Current password required to reauthenticate.",
//           error: err,
//         };
//       }

//       const email = user.email;
//       if (!email) {
//         return {
//           ok: false,
//           message:
//             "User has no email on record and cannot be reauthenticated with password.",
//         };
//       }

//       try {
//         const cred = EmailAuthProvider.credential(email, currentPassword);
//         await reauthenticateWithCredential(user, cred);
//         await updatePassword(user, newPassword);
//         return { ok: true, reauthenticated: true };
//       } catch (reauthErr) {
//         return {
//           ok: false,
//           message: "Reauthentication failed.",
//           error: reauthErr,
//         };
//       }
//     }

//     // Other Firebase errors
//     return { ok: false, message: err?.message || "Password update failed.", error: err };
//   }
// }

// helper: send confirmation email (non-blocking for success semantics)

async function sendPasswordChangeEmail(user) {
  if (!user?.email) return { sent: false, message: "No email on user." };

  const url = "confirmation-mail-password";
  const emailPayload = {
    to: user.email,
    code: user.uid,
  };

  try {
    const emailRes = await fetch(baseurl + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
    });

    if (!emailRes.ok) {
      let msg = `Email send failed (${emailRes.status})`;
      try {
        const data = await emailRes.json();
        msg = data?.message || data?.error || msg;
      } catch (err) {
        console.error(err);

      }
      return { sent: false, message: msg };
    }

    return { sent: true };
  } catch (err) {
    return { sent: false, message: err?.message || "Email request failed." };
  }
}

export async function changePassword(newPassword, currentPassword) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return { ok: false, message: "No signed-in user." };

  try {
    // Try direct update first
    await updatePassword(user, newPassword);

    // Only on success → send email
    const emailInfo = await sendPasswordChangeEmail(user);
    return { ok: true, emailSent: emailInfo.sent, emailMessage: emailInfo.message };
  } catch (err) {
    // Requires recent login → try reauth if currentPassword provided
    if (err?.code === "auth/requires-recent-login") {
      if (!currentPassword) {
        return {
          ok: false,
          needsReauth: true,
          message: "Current password required to reauthenticate.",
          error: err,
        };
      }

      const email = user.email;
      if (!email) {
        return {
          ok: false,
          message: "User has no email on record and cannot be reauthenticated with password.",
        };
      }

      try {
        const cred = EmailAuthProvider.credential(email, currentPassword);
        await reauthenticateWithCredential(user, cred);
        await updatePassword(user, newPassword);

        // Only on success after reauth → send email
        const emailInfo = await sendPasswordChangeEmail(user);
        return { ok: true, reauthenticated: true, emailSent: emailInfo.sent, emailMessage: emailInfo.message };
      } catch (reauthErr) {
        return { ok: false, message: "Reauthentication failed.", error: reauthErr };
      }
    }

    // Other Firebase errors
    return { ok: false, message: err?.message || "Password update failed.", error: err };
  }
}


export async function deleteCurrentUser(uid) {
  const auth = getAuth();
  const user = auth.currentUser;

  const userRecord = await admin.auth().getUser(uid);

  if (!uid) return { ok: false, message: "No signed-in user." };

  // const uid = user.uid; // 👈 here is the UID


  // try {
  //   // await deleteUser(user);
  //   // you can send uid to your backend to clean up related data
  //   return { ok: true, uid };
  // } catch (err) {
  //   return { ok: false, message: "Could not delete account.", error: err };
  // }
}


// export async function companyEmailExists(email) {
//   const companiesRef = collection(db, "companies");
//   const q = query(companiesRef, where("email", "==", email));

//   // console.log(q);


//   const snap = await getDocs(q);
//   console.log('snap', snap);


//   return !snap.empty;
// }

export async function companyEmailExists(email) {
  const companiesRef = collection(db, "companies");

  const q = query(
    companiesRef,
    where("email", "==", email),
    where("status", "==", 1)
  );

  const snap = await getDocs(q);
  return !snap.empty;
}
