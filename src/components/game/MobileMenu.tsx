"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { STAGES } from "@/data/profile";

/** Full-screen "pause menu" style navigation for small screens. */
export default function MobileMenu({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border-2 border-line bg-panel text-foreground transition-colors hover:border-accent hover:text-accent ${className}`}
      >
        <Menu className="h-4 w-4" />
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between border-b-4 border-line px-5 py-4">
              <span className="font-pixel text-[10px] text-gold">⏸ PAUSED</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 cursor-pointer items-center justify-center border-2 border-line bg-panel hover:border-accent hover:text-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-2 px-6">
              {[{ id: "top", label: "Start" }, ...STAGES].map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  className="pop-in group flex items-center gap-4 border-2 border-transparent px-4 py-3.5 font-pixel text-sm text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:border-accent"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="w-4 text-accent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                    ▶
                  </span>
                  {s.label.toUpperCase()}
                </a>
              ))}
            </nav>
            <p className="pb-8 text-center font-pixel text-[8px] text-muted">
              PRESS ESC OR ✕ TO RESUME
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}
