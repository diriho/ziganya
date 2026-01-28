import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyCtzfnfk5vkYOfKsehymqksTT9ArLGECRs",
  authDomain: "ziganya-d26c1.firebaseapp.com",
  projectId: "ziganya-d26c1",
  storageBucket: "ziganya-d26c1.firebasestorage.app",
  messagingSenderId: "771399655388",
  appId: "1:771399655388:web:3dfded40f1dda0320cb919",
  measurementId: "G-2HVVX549BW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

/**
 * Ensure a user is signed in before performing an action.
 * If not signed in, redirect to /login and return false.
 * Returns true when a user is signed in.
 */
export function ensureSignedIn(): boolean {
  if (!auth.currentUser) {
    // hard redirect to the login page
    window.location.href = "/login";
    return false;
  }
  return true;
}

export { app, auth, googleProvider, db };