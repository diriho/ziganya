import { useState } from "react";
import Header from "../components/Header";
import Button from "../components/Button";
import { motion } from "framer-motion";
import { ArrowRight, CreditCard, Receipt, Smartphone } from "lucide-react";
import Feature from "../components/Feature";
import UIMock from "../components/Home";
import Footer from "../components/Footer";
import { useNavigate } from "react-router";
import Login from "./Login";
import { dbClient } from "@sdk/db";

export default function Home() {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleGetStarted = async () => {
    const {
      data: { session },
    } = await dbClient.auth.getSession();

    if (session?.user) {
      navigate("/dashboard");
      return;
    }

    setIsLoginOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsLoginOpen(false);
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfc] overflow-hidden">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section id="about" className="relative pt-40 pb-20 px-4">
          <div className="max-w-[1200px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-[3.75rem] md:text-[6rem] font-bold tracking-[-0.04em] text-[#063b1e] mb-8 leading-[0.9]">
                Finance tracking that<br />doesn't feel like work.
              </h1>
              <p className="max-w-2xl mx-auto mb-12 text-xl md:text-2xl text-[#71717a] font-medium">
                Ziganya captures your spending from receipts, bank screenshots, and messages. No manual data entry, just magic.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button type="button" variant="primary" className="group relative flex items-center gap-2 px-8 py-4 bg-[#063b1e] text-[#6eff8a] rounded-full font-bold text-lg shadow-[0_10px_32px_0_rgba(6,59,30,0.1)] transition-all duration-200 hover:bg-black active:scale-95" onClick={handleGetStarted}>
                  <span>Get Started</span>
                  <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
                <Button type="button" variant="secondary" className="px-8 py-4 bg-white border border-[#e4e4e7] rounded-full font-bold text-lg transition-transform duration-200 hover:bg-[#f4f4f5] active:scale-95">
                  See how it works
                </Button>
              </div>
            </motion.div>

            {/* UI mockup Section */}
            <UIMock />
            
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white border-y border-[#f4f4f5]">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
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
        <section id="contact" className="py-20 px-4 bg-[#063b1e]">
          <div className="max-w-[1200px] mx-auto text-center">
            <h2 className="text-5xl md:text-[4.5rem] font-bold text-[#6eff8a] mb-12 tracking-[-0.02em]">
              Take control of your cash.<br />Starting today.
            </h2>
            <Button type="button" variant="primary" className="inline-block px-12 py-6 bg-white text-[#063b1e] rounded-full font-bold text-xl shadow-[0_12px_40px_0_rgba(6,59,30,0.15)] transition-all duration-200 hover:bg-[#6eff8a] hover:text-[#063b1e] hover:scale-105 transform" onClick={handleGetStarted}>
              <span>Get Started</span>
            </Button>
          </div>
        </section>
      </main>

      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />
      
      <Footer />
    </div>
  );
}
