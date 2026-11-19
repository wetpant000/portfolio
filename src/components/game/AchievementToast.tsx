"use client";

import { useEffect, useState } from "react";
import PixelArt, { SPRITES, tintPalette } from "./PixelArt";

/** Pops an "achievement unlocked" toast the first time the trophy room is reached. */
export default function AchievementToast({ targetId = "trophies" }: { targetId?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          setShow(true);
          timer = setTimeout(() => setShow(false), 4500);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [targetId]);

  if (!show) return null;
  return (
    <div role="status" className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      <div className="toast-in pixel-box flex items-center gap-4 px-4 py-3 pr-6">
        <span className="flex h-11 w-11 items-center justify-center bg-gold/15 p-1.5">
          <PixelArt rows={SPRITES.trophy} palette={tintPalette("var(--gold)")} className="h-full w-full" />
        </span>
        <div>
          <p className="font-pixel text-[8px] text-gold">ACHIEVEMENT UNLOCKED</p>
          <p className="mt-1.5 text-sm font-semibold">Explorer</p>
          <p className="text-xs text-muted">Found the trophy room</p>
        </div>
      </div>
    </div>
  );
}
