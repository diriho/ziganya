import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { HeroPreview } from "./HeroPreview";

export function Hero({ onGetStarted, isAuthed }: { onGetStarted: () => void; isAuthed: boolean }) {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-20 pt-36 sm:pt-44">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--c-accent)_28%,transparent),_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--c-accent)_12%,transparent),_transparent_60%)]" />
      <div className="mx-auto max-w-[1100px] text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-2 shadow-sm">
            <Sparkles size={14} className="text-brand" /> Receipts, screenshots, and messages — parsed for you
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl md:text-7xl">
            Finance tracking that <span className="text-brand">doesn't feel like work.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-ink-2 sm:text-xl">
            Ziganya turns receipts, bank screenshots, and messages into a clear picture of your spending, subscriptions, and budget. No spreadsheets, no manual entry.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={onGetStarted} rightIcon={<ArrowRight size={18} />} className="w-full sm:w-auto">
              {isAuthed ? "Open your dashboard" : "Get started — it's free"}
            </Button>
            <a
              href="#how"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-line bg-surface px-6 text-base font-semibold text-ink shadow-sm transition-colors hover:bg-surface-2 sm:w-auto"
            >
              See how it works
            </a>
          </div>
        </motion.div>
        <HeroPreview />
      </div>
    </section>
  );
}
