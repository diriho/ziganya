

import Header from "../components/Header/Header";
import Button from "../components/Button/Button";
import { motion } from "framer-motion";
import { ArrowRight, CreditCard, Receipt, Smartphone } from "lucide-react";
import Feature from "../components/Feature/feature";
import UIMock from "../components/UIMockup/uimock";
import Footer from "../components/Footer/Footer";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-root">
      <Header />

      <main className="home-main">
        {/* Hero Section */}
        <section className="home-hero-section">
          <div className="home-hero-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="home-hero-title">
                Finance tracking that<br />doesn't feel like work.
              </h1>
              <p className="home-hero-description">
                Ziganya captures your spending from receipts, bank screenshots, and messages. No manual data entry, just magic.
              </p>
              <div className="home-hero-actions">
                <Button type="button" variant="primary" className="getting_started-btn">
                  Get Started
                  <ArrowRight className="home-arrow-icon" />
                </Button>
                <Button type="button" variant="secondary" className="see_how-btn">
                  See how it works
                </Button>
              </div>
            </motion.div>

            {/* UI mockup Section */}
            <UIMock />
            
          </div>
        </section>

        {/* Features Section */}
        <section className="home-features-section">
          <div className="home-features-container">
            <div className="home-features-grid">
              <Feature
                icon={<Receipt style={{ color: '#063b1e' }} />}
                title="Snap your receipts"
                description="Just take a photo. Ziganya extracts the merchant, amount, and category instantly. No more messy wallets."
              />
              <Feature
                icon={<Smartphone style={{ color: '#063b1e' }} />}
                title="Screenshot transactions"
                description="Screenshot bank notifications or app transactions. We'll parse the data and add it to your tracking automatically."
              />
              <Feature
                icon={<CreditCard style={{ color: '#063b1e' }} />}
                title="Track Subscriptions"
                description="Keep tabs on recurring payments. Ziganya finds them and alerts you when prices change or trials end."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="home-cta-section">
          <div className="home-cta-container">
            <h2 className="home-cta-title">
              Take control of your cash.<br />Starting today.
            </h2>
            <Button type="button" variant="primary" className="start_now-btn">
              Get Started Now
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
