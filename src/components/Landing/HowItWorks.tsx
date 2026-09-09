import { Camera, LineChart, ScanLine } from "lucide-react";

const steps = [
  { icon: Camera, title: "Capture", body: "Snap a receipt, drop a bank screenshot, or add a transaction in seconds." },
  { icon: ScanLine, title: "Ziganya reads it", body: "Merchant, amount, date, and category are extracted and filed for you." },
  { icon: LineChart, title: "See the picture", body: "Spending trends, budgets, and upcoming renewals — accurate and up to date." },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-28 border-y border-line bg-surface py-24">
      <div className="mx-auto max-w-[1100px] px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">Three steps, then it runs itself.</h2>
        </div>
        <ol className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-3xl border border-line bg-bg p-7">
              <span className="absolute right-6 top-6 font-display text-4xl font-bold text-line-strong">0{i + 1}</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-fg">
                <s.icon size={22} />
              </span>
              <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
