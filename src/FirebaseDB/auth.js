import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updatePassword
} from "firebase/auth";


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

  const url = "https://mmfinfotech.co/leadfire-backend/api/confirmation-mail-password";
  const emailPayload = {
    to: user.email,
    uid: user.uid,
    // add anything else your API expects, e.g. name: user.displayName
  };

  try {
    const emailRes = await fetch(url, {
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
