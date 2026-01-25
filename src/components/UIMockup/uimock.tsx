import { Receipt, Smartphone, Sparkles, Wallet } from 'lucide-react';
import './uimock.css';

export default function UIMock() {
  return (
    <div className="uimock-visual-teaser">
      <div className="uimock-visual-mockup">
        <div className="uimock-visual-gradient" />
        {/* UI Elements */}
        <div className="uimock-mock-receipts">
          <div className="uimock-mock-receipt">
            <div className="uimock-mock-receipt-icon">
              <Receipt className="uimock-mock-receipt-icon-svg" size={20} />
            </div>
            <div className="uimock-mock-receipt-text">
              <p className="uimock-mock-receipt-title">Receipt scanned</p>
              <p className="uimock-mock-receipt-desc">Starbucks • $4.50</p>
            </div>
          </div>
          <div className="uimock-mock-bank">
            <div className="uimock-mock-bank-icon">
              <Smartphone className="uimock-mock-bank-icon-svg" size={20} />
            </div>
            <div className="uimock-mock-bank-text">
              <p className="uimock-mock-bank-title">Bank SMS detected</p>
              <p className="uimock-mock-bank-desc">Apple • $9.99</p>
            </div>
          </div>
        </div>
        <div className="uimock-visual-center">
          <div className="uimock-visual-center-bg" />
          <Sparkles className="uimock-visual-center-icon" />
        </div>
        <div className="uimock-mock-spending">
          <div className="uimock-mock-spending-card">
            <div className="uimock-mock-spending-header">
              <p className="uimock-mock-spending-title">Spending Today</p>
              <Wallet className="uimock-mock-spending-wallet" size={20} />
            </div>
            <div className="uimock-mock-spending-amount">$14.49</div>
            <div className="uimock-mock-spending-bar-bg">
              <div className="uimock-mock-spending-bar" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
