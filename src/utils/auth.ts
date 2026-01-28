import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebaseConfig";

export async function signInWithGoogle(navigate: (path: string) => void) {
  try {
    await signInWithPopup(auth, googleProvider);
    navigate("/login");
  } catch (err) {
    console.error("Google sign-in failed", err);
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Sign-out failed", err);
  }
}
