
import React, { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase/firebaseConfig";
import { Chrome } from "lucide-react";
import "../pages/Login.css"; // Reuse the css created

interface SignInProps {
  onSuccess?: () => void;
}

const SignIn = ({ onSuccess }: SignInProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createOrUpdateUserDoc(u: User) {
    try {
      const ref = doc(db, "users", u.uid);
      await setDoc(
        ref,
        { uid: u.uid, email: u.email ?? null, displayName: u.displayName ?? null, lastSeen: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to write user doc", err);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await createOrUpdateUserDoc(res.user);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err?.message ?? "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        await createOrUpdateUserDoc(cred.user);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err?.message ?? "Email sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        await createOrUpdateUserDoc(cred.user);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif" }}>
        <div>
          <h3 style={{ margin: "0 0 16px 0", textAlign: "center", color: "white",
    fontSize: "1rem", fontWeight: "bold" }}>Sign in</h3>
          
          <form onSubmit={handleEmailSignIn}>
            <input 
              className="auth-input"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email" 
              type="email" 
              required 
              style={{ color: "white" }}
            />
            <div style={{ marginTop: 8 }}>
              <input 
                className="auth-input"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password" 
                type="password" 
                required
                style={{ color: "white" }}
              />    
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: "8px" }}>
              <button type="submit" className="auth-submit-btn" disabled={loading}>Sign in</button>
              <button 
                type="button" 
                onClick={handleRegister} 
                disabled={loading} 
                className="auth-submit-btn"
                style={{ backgroundColor: "#28a745" }} // distinct green for register
              >
                Register
              </button>
            </div>
          </form>

          <div className="auth-separator">or</div>

          <button className="google-btn" onClick={handleGoogleSignIn} disabled={loading}>
            <Chrome size={20} />
            <span>Sign in with Google</span>
          </button>

          {error && <div style={{ marginTop: 12, color: "crimson", textAlign: "center" }}><small>{error}</small></div>}
        </div>
    </div>
  );
}

export default SignIn;  