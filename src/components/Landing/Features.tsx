import { BarChart3, CalendarDays, CreditCard, Moon, PiggyBank, Receipt } from "lucide-react";

const features = [
  { icon: Receipt, title: "Snap your receipts", body: "Upload a photo or PDF and Ziganya extracts the merchant, amount, and category. No more messy wallets." },
  { icon: CreditCard, title: "Track subscriptions", body: "Every recurring charge in one list, normalized to a monthly cost, with reminders before renewals." },
  { icon: BarChart3, title: "Honest analytics", body: "Spending by day, week, or category — computed from your real transactions, never made up." },
  { icon: PiggyBank, title: "Budgets that breathe", body: "Set a monthly limit and watch a live meter of what's left, with a daily allowance to stay on track." },
  { icon: CalendarDays, title: "Calendar view", body: "See transactions and renewals on the days they land. Plan cash flow before it happens." },
  { icon: Moon, title: "Dark mode & export", body: "Beautiful in light or dark. Export your ledger to CSV whenever you want it." },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-28 py-24">
      <div className="mx-auto max-w-[1100px] px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Features</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to know where your money went.</h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="group rounded-3xl border border-line bg-surface p-7 shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-pop">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-primary group-hover:text-primary-fg">
                <f.icon size={20} />
              </span>
              <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-2">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
