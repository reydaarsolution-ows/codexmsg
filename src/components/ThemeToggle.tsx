"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // Initialize from localStorage or system preference
    try {
      const stored = localStorage.getItem("theme");
      const preferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark = stored ? stored === "dark" : preferDark;
      setIsDark(dark);
      document.documentElement.classList.toggle("dark", dark);
    } catch {}
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors
                 border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50
                 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      {isDark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
