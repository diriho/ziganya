import { Link } from "react-router";
import { LogoMark, Wordmark } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface py-10">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-6 px-4 sm:flex-row">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Ziganya home">
          <LogoMark size={28} />
          <Wordmark className="text-base" />
        </Link>
        <p className="text-sm text-muted">© {new Date().getFullYear()} Ziganya. Built for people who'd rather not do data entry.</p>
        <nav aria-label="Footer" className="flex items-center gap-5 text-sm font-medium text-ink-2">
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#features" className="hover:text-ink">Features</a>
          <Link to="/dashboard" className="hover:text-ink">Dashboard</Link>
        </nav>
      </div>
    </footer>
  );
}
