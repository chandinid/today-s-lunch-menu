import { useEffect, useState } from "react";

/** Sun/moon toggle that flips a "dark" class on <html>, persisted to localStorage. The initial
 * theme itself is set synchronously by an inline script in __root.tsx (before React hydrates) so
 * there's no flash of the wrong theme — this component just needs to read that starting state
 * back out once it mounts, and let the person flip it from there. */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Private browsing / storage disabled — theme just won't persist across visits.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed right-4 top-4 z-40 flex size-10 items-center justify-center rounded-full border-2 border-border bg-card text-lg shadow-[var(--shadow-card)] hover:bg-secondary sm:right-6 sm:top-6"
    >
      <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
    </button>
  );
}
