import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DARK_MEDIA,
  THEME_STORAGE_KEY,
  ThemeContext,
  applyTheme,
  readThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readThemePreference);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(readThemePreference()));

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  // Follow OS changes only while in "system" mode.
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia(DARK_MEDIA);
    const onChange = () => {
      const next: ResolvedTheme = mq.matches ? "dark" : "light";
      applyTheme(next);
      setResolved(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    const nextResolved = resolveTheme(next);
    // Apply synchronously so anything reading CSS variables during the next
    // render (charts) already sees the new theme.
    applyTheme(nextResolved);
    setPreferenceState(next);
    setResolved(nextResolved);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setPreference(resolved === "dark" ? "light" : "dark");
  }, [resolved, setPreference]);

  const value = useMemo(() => ({ preference, resolved, setPreference, toggle }), [preference, resolved, setPreference, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
