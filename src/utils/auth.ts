import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebaseConfig";

export async function signInWithGoogle(navigate: (path: string) => void) {
  try {
    await signInWithPopup(auth, googleProvider);
    navigate("/login");
  } catch (err) {
    console.error("Google sign-in failed", err);
  }
}
