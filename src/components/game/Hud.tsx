"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { STAGES } from "@/data/profile";
import MobileMenu from "./MobileMenu";


/** Sticky game HUD: appears after the hero, XP fills with scroll progress. */
export default function Hud() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(y > window.innerHeight * 0.85);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
      let a = -1;
      STAGES.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) a = i;
      });
      setActive(a);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <div className="border-b-4 border-line bg-panel/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 min-[360px]:gap-3 min-[360px]:px-4 sm:gap-5 sm:px-6">
          <a href="#top" className="font-pixel text-[10px] text-gold" tabIndex={visible ? 0 : -1}>
            P1
          </a>
          <span className="shrink-0 font-pixel text-[9px] text-foreground">
            LV {Math.max(1, active + 1)}
            <span className="hidden text-muted sm:inline"> · {STAGES[Math.max(0, active)].label}</span>
          </span>
          <span className="hidden shrink-0 font-pixel text-[8px] text-sky md:inline" title="Depth">
            ▼ {STAGES[Math.max(0, active)].depth}
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="hidden font-pixel text-[8px] text-muted sm:inline">XP</span>
            <div className="xp-track flex-1 !h-[10px]">
              <div className="xp-live" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="hidden w-9 text-right font-pixel text-[8px] text-muted min-[360px]:inline">{Math.round(progress * 100)}%</span>
          </div>
          <nav className="hidden items-center gap-4 lg:flex">
            {STAGES.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                tabIndex={visible ? 0 : -1}
                className={`font-pixel text-[8px] uppercase transition-colors hover:text-accent ${
                  i === active ? "text-accent" : "text-muted"
                }`}
              >
                {i === active ? "▸ " : ""}
                {s.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
          <MobileMenu className="lg:hidden" />
        </div>
      </div>
    </div>
  );
}
