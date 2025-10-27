// firebaseAuthUtils.js
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

/**
 * Change the current user's password.
 * If Firebase throws `auth/requires-recent-login`, call again with `currentPassword`.
 */
export async function changePassword(newPassword, currentPassword) {
  const auth = getAuth();
  const user = auth.currentUser;
  
console.log('user :- ',user);


  if (!user) throw new Error("No signed-in user.");

  try {
    await updatePassword(user, newPassword);
    return { ok: true };
  } catch (err) {
    // If the login is stale, reauthenticate and retry
    if (err?.code === "auth/requires-recent-login") {
      if (!currentPassword) {
        // Tell caller they must collect the current password and retry
        return { ok: false, needsReauth: true, message: "Current password required to reauthenticate." };
      }
      const email = user.email;
      if (!email) throw new Error("User has no email on record to reauthenticate.");

      const cred = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      return { ok: true, reauthenticated: true };
    }
    // Surface other Firebase errors
    throw err;
  }
}
