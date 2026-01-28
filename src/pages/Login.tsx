import { SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebaseConfig";

export default function Login() {
  const navigate = useNavigate();

  async function handleGoogleSignIn() {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/planner");
    } catch (err) {
      // minimal error handling — adjust as needed
      console.error("Google sign-in failed", err);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignIn routing="path" path="/login" />
      <button type="button" onClick={handleGoogleSignIn}>
        Sign in with Google
      </button>
    </div>
  );
}
