// firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyD4ygAMkR8UsjSKFipaH9cUqiCfCiRtkZk",
  authDomain: "leadfire-efdc2.firebaseapp.com",
  projectId: "leadfire-efdc2",
  // storageBucket: "leadfire-efdc2.firebasestorage.app"
  storageBucket: "leadfire-efdc2.appspot.com",
  messagingSenderId: "992054112505",
  appId: "1:992054112505:web:5262b4465c2f9069b5b228",
  measurementId: "G-T12Y221JHE"
};

const app = initializeApp(firebaseConfig)
export const appH = app


export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider)
  return result.user
}

export async function signOutFirebase() {
  await signOut(auth)
}
