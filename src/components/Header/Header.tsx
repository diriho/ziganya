import { Apple } from 'lucide-react';
import Button from '../Button/Button';
import './Header.css';


const Header = () => {
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
        <Button type="button" variant="primary" className="download-btn">
          <Apple size={16} className="header-download-icon" />
          <span className="header-download-text">Download</span>
        </Button>
      </div>
    </nav>
  );
};

export default Header