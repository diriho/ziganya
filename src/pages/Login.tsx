import React from "react";
import { createPortal } from "react-dom";
import SignIn from "../components/SignIn";
import "./Login.css";

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose}>
          &times;
        </button>
        <SignIn onSuccess={onClose} />
      </div>
    </div>,
    document.body
  );
};

export default Login;
