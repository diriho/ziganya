
import React, { useState } from "react";
import googleSignIn_Logic from "../utils/googleAuth";
import emailPassword_Logic from "../utils/EmailPassword";
import { Chrome } from "lucide-react";

interface SignInProps {
  onSuccess?: () => void;
}

const SignIn = ({ onSuccess }: SignInProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    const { error } = await googleSignIn_Logic();
    if (error) {
       setError(error);
    }
    // Note: This will trigger a redirect, so subsequent code might not execute in this session context.
    setLoading(false);
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const { user, error } = await emailPassword_Logic.signIn(email, password);
    
    if (error) {
        setError(error);
    } else if (user && onSuccess) {
        onSuccess();
    }
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const { user, error } = await emailPassword_Logic.register(email, password);
    
    if (error) {
        setError(error);
    } else if (user && onSuccess) {
        onSuccess();
    }
    setLoading(false);
  }

  return (
    <div className="font-sans">
        <div>
          <h3 className="text-center text-white text-base font-bold mb-4">Sign in</h3>
          
          <form onSubmit={handleEmailSignIn}>
            <input 
              className="w-full p-2.5 mb-3 border border-[#ddd] rounded box-border text-white bg-transparent placeholder-gray-400"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email" 
              type="email" 
              required 
            />
            <div className="mt-2">
              <input 
                className="w-full p-2.5 mb-3 border border-[#ddd] rounded box-border text-white bg-transparent placeholder-gray-400"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password" 
                type="password" 
                required
              />    
            </div>
            <div className="mt-3 flex gap-2">
              <button type="submit" className="w-full p-2.5 bg-[#007bff] text-white border-none rounded cursor-pointer font-bold hover:bg-[#0056b3] disabled:opacity-50" disabled={loading}>Sign in</button>
              <button 
                type="button" 
                onClick={handleRegister} 
                disabled={loading} 
                className="w-full p-2.5 bg-[#28a745] text-white border-none rounded cursor-pointer font-bold hover:bg-[#218838] disabled:opacity-50"
              >
                Register
              </button>
            </div>
          </form>

          <div className="my-4 text-center text-[#666] text-sm">or</div>

          <button className="flex items-center justify-center gap-2.5 w-full p-2.5 mt-4 bg-white border border-[#ddd] rounded cursor-pointer font-inherit hover:bg-[#f9f9f9] disabled:opacity-50" onClick={handleGoogleSignIn} disabled={loading}>
            <Chrome size={20} />
            <span>Sign in with Google</span>
          </button>

          {error && <div className="mt-3 text-[crimson] text-center text-sm"><small>{error}</small></div>}
        </div>
    </div>
  );
}

export default SignIn;  