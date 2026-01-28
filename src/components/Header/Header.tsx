import Button from '../Button/Button';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import { Apple } from 'lucide-react';
import { signInWithGoogle } from '../../utils/auth';

const Header = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    signInWithGoogle(navigate);
  }

  return (
    <nav className="header-nav">
      <div className="header-container">
        <div className="header-logo-group">
          <span className="header-logo-text"><a href="#">ziganya</a></span>
          <div className="header-logo-bar" />
        </div>
        <div className="header-links">
          <a href="#" className="header-link">Features</a>
          <a href="#" className="header-link">About</a>
          <a href="#" className="header-link">Contact</a>
        </div>
        <Button
          type="button"
          variant="primary"
          className="sign-in_btn"
          onClick={handleSignIn}
        >
          <Apple size={16} className="header-sign-in-icon" />
          <span className="header-sign-in-text">Sign In</span>
        </Button>
      </div>
    </nav>
  );
};

export default Header;