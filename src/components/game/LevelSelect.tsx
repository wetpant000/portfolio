"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from "lucide-react";
import type { Project } from "@/data/profile";

const CART_COLORS = ["var(--accent)", "var(--rose)", "var(--gold)", "var(--sky)"];

function StatusBadge({ status }: { status: Project["status"] }) {
  return status === "complete" ? (
    <span className="bg-gold px-2 py-1.5 font-pixel text-[7px] whitespace-nowrap text-background">✔ COMPLETE</span>
  ) : (
    <span className="border-2 border-rose px-2 py-1 font-pixel text-[7px] whitespace-nowrap text-rose">
      <span className="blink">●</span> IN PROGRESS
    </span>
  );
}

/** "Level select" for projects: pick a cartridge, it loads onto a CRT screen with its demo. */
export default function LevelSelect({ projects, githubUrl, handle }: { projects: Project[]; githubUrl: string; handle: string }) {
  const [idx, setIdx] = useState(0);
  const [mediaIdx, setMediaIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const p = projects[idx];
  const media = p.media[mediaIdx] ?? p.media[0];
  const color = CART_COLORS[idx % CART_COLORS.length];

  const pick = (i: number) => {
    setIdx(i);
    setMediaIdx(0);
  };
  const step = (d: number) => setMediaIdx((m) => (m + d + p.media.length) % p.media.length);

  // Keep the video's muted state in sync with the toggle.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted, idx, mediaIdx]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
      {/* ---------- Cartridges ---------- */}
      <div className="min-w-0">
        <p className="mb-3 font-pixel text-[8px] text-muted">SELECT A CARTRIDGE</p>
        <ul role="tablist" aria-label="Projects" className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pt-1 pb-3 lg:flex-col lg:overflow-visible">
          {projects.map((proj, i) => {
            const active = i === idx;
            const c = CART_COLORS[i % CART_COLORS.length];
            return (
              <li key={proj.name} className="shrink-0 snap-start lg:shrink">
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => pick(i)}
                  className={`cartridge group relative block w-52 cursor-pointer text-left transition-transform lg:w-full ${
                    active ? "lg:translate-x-3" : "hover:-translate-y-0.5 lg:hover:translate-x-1.5 lg:hover:translate-y-0"
                  }`}
                  style={{ "--cart": c } as React.CSSProperties}
                >
                  {/* cartridge body */}
                  <span className={`block border-4 bg-panel p-3 ${active ? "border-[var(--cart)]" : "border-line"}`}>
                    <span className="mb-2 flex items-center justify-between font-pixel text-[7px]">
                      <span style={{ color: c }}>{proj.featured ? `WORLD ${i + 1}` : "BONUS"}</span>
                      <span className="text-muted">{proj.status === "complete" ? "✔" : "…"}</span>
                    </span>
                    {/* label */}
                    <span className="block px-2 py-2" style={{ background: `color-mix(in srgb, ${c} 18%, transparent)` }}>
                      <span className="block truncate font-semibold">{proj.name}</span>
                      <span className="block truncate text-xs text-muted">{proj.subtitle}</span>
                    </span>
                    {/* contact pins */}
                    <span aria-hidden className="mt-2 flex gap-1">
                      {Array.from({ length: 9 }, (_, k) => (
                        <span key={k} className="h-1.5 flex-1" style={{ background: active ? c : "var(--line)" }} />
                      ))}
                    </span>
                  </span>
                  {active && (
                    <span aria-hidden className="absolute top-1/2 -left-4 hidden -translate-y-1/2 font-pixel text-xs text-accent lg:block">
                      ▶
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 hidden font-pixel text-[8px] text-muted transition-colors hover:text-accent lg:inline-block"
        >
          ▶ ALL REPOS @{handle.toUpperCase()}
        </a>
      </div>

      {/* ---------- Console ---------- */}
      <div className="min-w-0">
        {/* CRT */}
        <div className="pixel-box bg-[#11161b] p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between px-1 font-pixel text-[7px] text-[#8b949e]">
            <span>
              {p.featured ? `LEVEL ${idx + 1}-1` : "BONUS LEVEL"} · {p.name.toUpperCase()}
            </span>
            <span className="flex items-center gap-2">
              <span className="blink inline-block h-1.5 w-1.5 rounded-full bg-[#ff4d6d]" /> LIVE
            </span>
          </div>

          <div className="crt relative aspect-video overflow-hidden bg-black">
            <div key={`${idx}-${mediaIdx}`} className="crt-on absolute inset-0">
              {media.type === "video" ? (
                <video
                  ref={videoRef}
                  src={media.src}
                  poster={media.poster}
                  autoPlay
                  loop
                  muted={muted}
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={media.src}
                  alt={media.caption}
                  fill
                  sizes="(min-width: 1024px) 760px, 95vw"
                  unoptimized={media.src.endsWith(".gif")}
                  className={media.fit === "contain" ? "object-contain p-2" : "object-cover object-top"}
                  style={media.fit === "contain" ? { background: media.src.endsWith(".gif") ? "#0d1117" : "#fff" } : undefined}
                />
              )}
            </div>
            {/* scanlines + vignette */}
            <span aria-hidden className="crt-overlay pointer-events-none absolute inset-0" />

            {media.type === "video" && (
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Unmute demo" : "Mute demo"}
                className="absolute right-3 bottom-3 z-10 flex cursor-pointer items-center gap-1.5 border-2 border-white/40 bg-black/60 px-2 py-1.5 font-pixel text-[7px] text-white hover:border-white"
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                {muted ? "SOUND OFF" : "SOUND ON"}
              </button>
            )}
            {p.media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous screenshot"
                  className="absolute top-1/2 left-2 z-10 -translate-y-1/2 cursor-pointer border-2 border-white/40 bg-black/60 p-1 text-white hover:border-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next screenshot"
                  className="absolute top-1/2 right-2 z-10 -translate-y-1/2 cursor-pointer border-2 border-white/40 bg-black/60 p-1 text-white hover:border-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* caption + thumbnails */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <p className="text-sm text-[#c9d1d9]">
              <span className="font-pixel text-[7px] text-[#8b949e]">
                {mediaIdx + 1}/{p.media.length}
              </span>{" "}
              {media.caption}
            </p>
            {p.media.length > 1 && (
              <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Screenshots">
                {p.media.map((m, i) => (
                  <button
                    key={m.src}
                    type="button"
                    role="tab"
                    aria-selected={i === mediaIdx}
                    aria-label={m.caption}
                    onClick={() => setMediaIdx(i)}
                    className={`relative h-9 w-14 shrink-0 cursor-pointer overflow-hidden border-2 transition-opacity ${
                      i === mediaIdx ? "border-accent opacity-100" : "border-[#2f3d48] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={m.type === "video" ? m.poster : m.src} alt="" fill sizes="56px" className="object-cover" unoptimized={m.src.endsWith(".gif")} />
                    {m.type === "video" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="h-3 w-3 fill-white text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quest details */}
        <div key={idx} className="pop-in mt-6 grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-semibold sm:text-3xl" style={{ color }}>
                {p.name}
              </h3>
              <StatusBadge status={p.status} />
            </div>
            <p className="mb-5 text-muted">{p.subtitle}</p>
            <p className="mb-3 font-pixel text-[8px] text-gold">OBJECTIVES</p>
            <ul className="space-y-2.5 leading-relaxed text-foreground/85">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-2.5">
                  <span className={p.status === "complete" ? "text-accent" : "text-rose"} aria-hidden>
                    {p.status === "complete" ? "✔" : "▸"}
                  </span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col">
            <p className="mb-3 font-pixel text-[8px] text-gold">LOOT</p>
            <ul className="mb-6 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <li key={s} className="border-2 border-line bg-accent/10 px-2 py-1 text-sm text-accent">
                  {s}
                </li>
              ))}
            </ul>
            <a href={p.repo} target="_blank" rel="noreferrer" className="pixel-btn self-start">
              ▶ View source
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
