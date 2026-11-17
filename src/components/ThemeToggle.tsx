"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const systemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

const savedTheme = (): Theme | null => {
  try {
    const v = localStorage.getItem("theme");
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as Theme) || systemTheme());

    // Follow the OS setting until the visitor picks one explicitly.
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (savedTheme()) return;
      const next = systemTheme();
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      title={theme === "light" ? "Dark mode" : "Light mode"}
      className="flex h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center gap-2 border-2 border-line bg-panel px-2 font-pixel text-[8px] text-foreground transition-colors hover:border-accent hover:text-accent"
    >
      {/* Stable label until mounted to avoid a hydration mismatch. */}
      <span aria-hidden>{theme === null ? "◐" : theme === "light" ? "☾" : "☀"}</span>
      <span className="hidden sm:inline">{theme === null ? "" : theme === "light" ? "DARK" : "LIGHT"}</span>
    </button>
  );
}
