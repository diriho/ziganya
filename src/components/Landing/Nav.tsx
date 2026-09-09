import { Link } from "react-router";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { useAuth } from "@sdk/auth";
import { useTheme } from "@/providers/theme";
import { Button, LinkButton } from "@/components/ui";
import { LogoMark, Wordmark } from "@/components/Logo";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
];

export function Nav({ onSignIn }: { onSignIn: () => void }) {
  const { session } = useAuth();
  const { resolved, toggle } = useTheme();

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
      <nav className="flex w-full max-w-3xl items-center gap-2 rounded-full border border-line bg-surface/85 py-2 pl-3 pr-2 shadow-pop backdrop-blur-md" aria-label="Main">
        <Link to="/" className="flex items-center gap-2 rounded-full pr-2" aria-label="Ziganya home">
          <LogoMark size={30} />
          <Wordmark className="hidden text-base sm:block" />
        </Link>
        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={toggle}
          className="ml-auto rounded-full p-2 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink md:ml-1"
          aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {resolved === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        {session ? (
          <LinkButton to="/dashboard" size="sm" className="rounded-full" rightIcon={<ArrowRight size={14} />}>
            Open dashboard
          </LinkButton>
        ) : (
          <Button size="sm" className="rounded-full" onClick={onSignIn}>
            Sign in
          </Button>
        )}
      </nav>
    </div>
  );
}
