import { ArrowRight } from "lucide-react";

export function CallToAction({ onGetStarted, isAuthed }: { onGetStarted: () => void; isAuthed: boolean }) {
  return (
    <section id="cta" className="px-4 pb-24">
      <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[32px] bg-[#063b1e] px-6 py-16 text-center text-white shadow-pop sm:px-12 sm:py-20 dark:bg-[#0f2f1c]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <h2 className="relative mx-auto max-w-3xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-accent sm:text-5xl md:text-6xl">
          Take control of your cash. Starting today.
        </h2>
        <p className="relative mx-auto mt-5 max-w-xl text-balance text-white/75">Free to use. Your data stays yours — export it any time.</p>
        <button
          type="button"
          onClick={onGetStarted}
          className="relative mt-9 inline-flex h-13 items-center gap-2 rounded-2xl bg-white px-8 text-base font-bold text-[#063b1e] shadow-lg transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-accent active:translate-y-0"
        >
          {isAuthed ? "Open your dashboard" : "Get started"} <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
