import React from "react";
import { createPortal } from "react-dom";
import SignIn from "../components/SignIn";

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={onClose}>
      <div className="bg-[linear-gradient(135deg,#243D25,#3B5A36)] p-6 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.1)] w-[90%] max-w-[400px] relative" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-2.5 right-2.5 bg-transparent border-none text-xl cursor-pointer text-[#666] hover:text-white" onClick={onClose}>
          &times;
        </button>
        <SignIn onSuccess={onSuccess ?? onClose} />
      </div>
    </div>,
    document.body
  );
};

export default Login;
