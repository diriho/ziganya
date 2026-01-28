import { useState, useEffect } from 'react';
import Button from '../Button/Button';
import './Header.css';
import { Apple, LogOut } from 'lucide-react';
import Login from '../../pages/Login';
import { auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { signOutUser } from '../../utils/auth';

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsLoginOpen(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = () => {
    setIsLoginOpen(true);
  }

  const handleSignOut = async () => {
    await signOutUser();
  };

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
        
        {user ? (
          <div className="header-user-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <span className="header-user-greeting" style={{ fontWeight: 600, fontSize: '14px', color: '#000' }}>
              Hi, {user.displayName ? user.displayName.split(' ')[0] : 'User'}
            </span>
            <Button
              type="button"
              variant="primary"
              className="sign-in_btn" 
              onClick={handleSignOut}
            >
              <LogOut size={16} className="header-sign-in-icon" />
              <span className="header-sign-in-text">Sign Out</span>
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="primary"
            className="sign-in_btn"
            onClick={handleSignIn}
          >
            <Apple size={16} className="header-sign-in-icon" />
            <span className="header-sign-in-text">Sign In</span>
          </Button>
        )}
      </div>
      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </nav>
  );
};

export default Header;