import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Receipt, Repeat2 } from "lucide-react";

const bars = [42, 58, 35, 71, 49, 88, 63, 54, 77, 46, 69, 92];

/** Decorative product preview for the landing hero (static sample data). */
export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-14 w-full max-w-5xl"
      aria-hidden
    >
      <div className="absolute -inset-x-10 -top-10 h-56 rounded-full bg-accent/30 blur-3xl dark:bg-accent/10" />
      <div className="relative rounded-[28px] border border-line bg-surface p-3 shadow-pop sm:p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-[#063b1e] p-5 text-left text-white dark:bg-[#0f2f1c]">
            <p className="text-xs font-medium text-white/70">Total balance</p>
            <p className="mt-2 font-display text-3xl font-bold">$12,480</p>
            <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
              <ArrowUpRight size={14} /> +$1,210 <span className="font-normal text-white/60">net this month</span>
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-2 p-5 text-left">
            <p className="text-xs font-medium text-muted">Spent this month</p>
            <p className="mt-2 font-display text-3xl font-bold text-ink">$2,410</p>
            <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-good">
              <ArrowDownRight size={14} /> −12% <span className="font-normal text-muted">vs last month</span>
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-2 p-5 text-left">
            <p className="text-xs font-medium text-muted">Budget used</p>
            <p className="mt-2 font-display text-3xl font-bold text-ink">64%</p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-3">
              <div className="h-full w-[64%] rounded-full bg-series-1" />
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-5 md:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-ink">Spending analytics</p>
              <div className="flex gap-1 rounded-lg bg-surface-2 p-1 text-[10px] font-semibold text-muted">
                <span className="rounded-md px-2 py-0.5">7D</span>
                <span className="rounded-md bg-surface px-2 py-0.5 text-ink shadow-sm">30D</span>
                <span className="rounded-md px-2 py-0.5">3M</span>
              </div>
            </div>
            <div className="mt-5 flex h-36 items-end gap-2">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.04, ease: "easeOut" }}
                  className="flex-1 rounded-t-[4px] bg-series-1"
                  style={{ opacity: i === bars.length - 1 ? 1 : 0.75 }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-medium text-muted">
              <span>Aug 10</span>
              <span>Aug 20</span>
              <span>Aug 30</span>
              <span>Sep 8</span>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5 text-left">
            <p className="text-sm font-bold text-ink">Recent activity</p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { icon: Receipt, name: "Whole Foods", meta: "Groceries · Today", amount: "-$84.20", good: false },
                { icon: Repeat2, name: "Netflix", meta: "Renews in 2 days", amount: "-$15.99", good: false },
                { icon: ArrowDownRight, name: "Salary", meta: "Income · Sep 1", amount: "+$3,200", good: true },
              ].map((row) => (
                <li key={row.name} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-ink-2">
                    <row.icon size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{row.name}</span>
                    <span className="block truncate text-xs text-muted">{row.meta}</span>
                  </span>
                  <span className={`tabular font-semibold ${row.good ? "text-good" : "text-ink"}`}>{row.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
