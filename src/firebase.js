// firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID
// }

const firebaseConfig = {
  apiKey: "AIzaSyD4ygAMkR8UsjSKFipaH9cUqiCfCiRtkZk",
  authDomain: "leadfire-efdc2.firebaseapp.com",
  projectId: "leadfire-efdc2",
  storageBucket: "leadfire-efdc2.firebasestorage.app",
  messagingSenderId: "992054112505",
  appId: "1:992054112505:web:5262b4465c2f9069b5b228",
  measurementId: "G-T12Y221JHE"
};


const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider)
  return result.user
}

export async function signOutFirebase() {
  await signOut(auth)
}
