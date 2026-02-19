import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-16 mx-auto max-w-5xl"
    >
      <div className="rounded-3xl border border-[#e4e4e7] bg-white p-3 shadow-[0_24px_64px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#f4f4f5] p-5 text-left">
            <p className="text-sm text-[#71717a]">This month</p>
            <p className="mt-2 text-3xl font-bold text-[#063b1e]">$2,410</p>
            <p className="mt-2 text-sm text-[#10b981]">+12% vs last month</p>
          </div>

          <div className="rounded-2xl bg-[#f4f4f5] p-5 text-left md:col-span-2">
            <p className="text-sm text-[#71717a]">Recent activity</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                <span className="text-[#18181b]">Netflix</span>
                <span className="font-semibold text-[#063b1e]">-$15.99</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                <span className="text-[#18181b]">Grocery Store</span>
                <span className="font-semibold text-[#063b1e]">-$84.20</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                <span className="text-[#18181b]">Salary</span>
                <span className="font-semibold text-[#16a34a]">+$3,200.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
