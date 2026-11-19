"use client";

import { useEffect, useRef } from "react";

/*
 * Ambient ASCII scenes behind each section. Scrolling down the page is a dive:
 * every section is a deeper ocean zone with its own creatures and props.
 * Rendering mirrors the hero (dithered brightness + character sprites) but is
 * sparser and only animates while the section is on screen.
 */

export type Zone = "shallows" | "kelp" | "wreck" | "treasure" | "twilight" | "midnight" | "abyss" | "floor";

type Cfg = {
  rays: number; // 0..1 light-ray strength
  snow: number; // drifting particles
  bubbles: number; // bubbles spawned per second
  fish: number; // tiny ASCII fish
  kelp: number; // kelp strands
  glows: number; // bioluminescent dots
  jellies: number;
  sprites: { art: readonly string[]; x: number; bottom: number }[]; // x: 0..1 of width, bottom: rows from bottom
  angler?: boolean;
  vents?: number;
  crab?: boolean;
  sand?: boolean;
  coins?: number; // glinting gold specks
  ink: string; // CSS background used as the text colour
};

const WRECK = [
  "            |            ",
  "           /|\\           ",
  "          / | \\          ",
  "         /  |  \\    ,    ",
  "        /___|___\\  /|    ",
  "   _____________|_/_|___ ",
  "   \\  o    o    o    o  /",
  "    \\__________________/ ",
];
const CHEST = [
  "   ______________   ",
  "  /  $  $  $  $  \\  ",
  " /________________\\ ",
  " |   ___[##]___   | ",
  " |  |          |  | ",
  " |__|__________|__| ",
];
const ANCHOR = [
  "    _    ",
  "   (_)   ",
  "    |    ",
  "  --+--  ",
  "    |    ",
  " \\_/ \\_/ ",
];
const VENT = ["  /^\\  ", " /   \\ ", "/_____\\"];
const ANGLER = [
  "        .   ",
  "       /    ",
  "  ____/_    ",
  " / o    \\_/|",
  " \\ vvvv _ \\|",
  "  \\____/    ",
];

export const ZONES: Record<Zone, { name: string; depth: string; cfg: Cfg }> = {
  shallows: {
    name: "THE SHALLOWS",
    depth: "10 M",
    cfg: { rays: 1, snow: 18, bubbles: 1.6, fish: 10, kelp: 0, glows: 0, jellies: 0, sprites: [], ink: "linear-gradient(to bottom, var(--accent), var(--sky))" },
  },
  kelp: {
    name: "KELP FOREST",
    depth: "40 M",
    cfg: { rays: 0.55, snow: 20, bubbles: 1.2, fish: 8, kelp: 14, glows: 0, jellies: 0, sprites: [], ink: "linear-gradient(to bottom, var(--accent), color-mix(in srgb, #65a30d 75%, var(--accent)))" },
  },
  wreck: {
    name: "THE SHIPWRECK",
    depth: "120 M",
    cfg: {
      rays: 0.3,
      snow: 26,
      bubbles: 0.6,
      fish: 4,
      kelp: 3,
      glows: 0,
      jellies: 0,
      sprites: [
        { art: WRECK, x: 0.86, bottom: 1 },
        { art: ANCHOR, x: 0.06, bottom: 1 },
      ],
      sand: true,
      ink: "linear-gradient(to bottom, var(--muted), var(--accent))",
    },
  },
  treasure: {
    name: "TREASURE CAVE",
    depth: "300 M",
    cfg: { rays: 0, snow: 22, bubbles: 0.5, fish: 3, kelp: 0, glows: 0, jellies: 0, coins: 26, sprites: [{ art: CHEST, x: 0.1, bottom: 1 }], sand: true, ink: "linear-gradient(to bottom, var(--gold), var(--accent))" },
  },
  twilight: {
    name: "TWILIGHT ZONE",
    depth: "600 M",
    cfg: { rays: 0, snow: 34, bubbles: 0.3, fish: 2, kelp: 0, glows: 22, jellies: 6, sprites: [], ink: "linear-gradient(to bottom, color-mix(in srgb, #8b5cf6 70%, var(--foreground)), var(--sky))" },
  },
  midnight: {
    name: "MIDNIGHT ZONE",
    depth: "1000 M",
    cfg: { rays: 0, snow: 30, bubbles: 0.2, fish: 0, kelp: 0, glows: 44, jellies: 2, angler: true, sprites: [], ink: "linear-gradient(to bottom, var(--sky), var(--accent))" },
  },
  abyss: {
    name: "THE ABYSS",
    depth: "3000 M",
    cfg: { rays: 0, snow: 24, bubbles: 0, fish: 0, kelp: 0, glows: 30, jellies: 0, vents: 4, sprites: [], sand: true, ink: "linear-gradient(to bottom, var(--rose), color-mix(in srgb, #8b5cf6 70%, var(--foreground)))" },
  },
  floor: {
    name: "THE SEA FLOOR",
    depth: "4000 M",
    cfg: { rays: 0, snow: 16, bubbles: 0.4, fish: 2, kelp: 5, glows: 6, jellies: 0, crab: true, sand: true, sprites: [], ink: "linear-gradient(to bottom, var(--accent), var(--gold))" },
  },
};

const RAMP = " .:-+*#%@";
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const FPS = 12;
const FISH_R = ["><>", "><('>", "><((('>", "><(((('>"];
const FISH_L = ["<><", "<')><", "<')))><", "<'))))><"];
const JELLY_A = ["  .-\"\"-.  ", " /  . .  \\ ", "(        )", " '-.__.-' ", "  ) ( ) ( ", "  ( ) ( ) ", "   ) ( )  "];
const JELLY_B = ["  .-\"\"-.  ", " /  . .  \\ ", "(        )", " '-.__.-' ", "  ( ) ( ) ", "  ) ( ) ( ", "  ( ) (   "];
const CRAB_A = "(\\/)(o,,,o)(\\/)";
const CRAB_B = "(\\/)(o'''o)(\\/)";

export default function AsciiBackdrop({ zone }: { zone: Zone }) {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const pre = preRef.current;
    const host = pre?.parentElement;
    if (!pre || !host) return;
    const cfg = ZONES[zone].cfg;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    let cols = 0, rows = 0, charW = 7, charH = 13, asp = 2;
    let buf = new Float32Array(0);
    let over: string[] = [];

    type Fish = { x: number; y: number; dir: number; speed: number; kind: number; phase: number; boost: number };
    type P = { x: number; y: number; v: number; phase: number };
    let fish: Fish[] = [], snow: P[] = [], glows: P[] = [], jellies: P[] = [], coins: P[] = [], kelp: P[] = [];
    let bubbles: P[] = [];
    const angler = { x: 0, y: 0, dir: 1 };
    const crab = { x: 0, dir: 1 };
    let vents: number[] = [];

    const populate = () => {
      fish = Array.from({ length: cfg.fish }, () => ({
        x: rand(0, cols), y: rand(rows * 0.1, rows * 0.8), dir: Math.random() < 0.5 ? -1 : 1,
        speed: rand(2, 6), kind: Math.floor(rand(0, 4)), phase: rand(0, 6), boost: 0,
      }));
      snow = Array.from({ length: cfg.snow }, () => ({ x: rand(0, cols), y: rand(0, rows), v: rand(0.3, 1.1), phase: rand(0, 6) }));
      glows = Array.from({ length: cfg.glows }, () => ({ x: rand(0, cols), y: rand(rows * 0.08, rows * 0.9), v: rand(0.6, 1.8), phase: rand(0, 6) }));
      jellies = Array.from({ length: cfg.jellies }, () => ({ x: rand(cols * 0.05, cols * 0.95), y: rand(0, rows), v: rand(0.6, 1.2), phase: rand(0, 6) }));
      coins = Array.from({ length: cfg.coins ?? 0 }, () => ({ x: rand(0, cols), y: rand(rows * 0.15, rows * 0.95), v: rand(1, 3), phase: rand(0, 6) }));
      kelp = Array.from({ length: cfg.kelp }, (_, i) => ({
        x: ((i + rand(0.2, 0.8)) / Math.max(1, cfg.kelp)) * cols, y: rand(rows * 0.25, rows * 0.6), v: rand(0.8, 1.4), phase: rand(0, 6),
      }));
      vents = Array.from({ length: cfg.vents ?? 0 }, (_, i) => ((i + 0.5) / (cfg.vents ?? 1)) * cols + rand(-6, 6));
      bubbles = [];
      angler.x = cols * 0.75; angler.y = Math.min(rows * 0.2, 30);
      crab.x = cols * 0.7;
    };

    const measure = () => {
      const probe = document.createElement("span");
      probe.textContent = "M".repeat(50);
      pre.appendChild(probe);
      charW = probe.getBoundingClientRect().width / 50 || 7;
      pre.removeChild(probe);
      const lh = parseFloat(getComputedStyle(pre).lineHeight);
      charH = Number.isFinite(lh) ? lh : 13;
      asp = charH / charW;
      const box = host.getBoundingClientRect();
      const nc = Math.max(10, Math.floor(box.width / charW));
      const nr = Math.max(6, Math.floor(box.height / charH));
      if (nc !== cols || nr !== rows) {
        cols = nc; rows = nr;
        buf = new Float32Array(cols * rows);
        over = new Array(cols * rows).fill("");
        populate();
      }
    };

    const put = (c: number, r: number, ch: string) => {
      c = Math.round(c); r = Math.round(r);
      if (c >= 0 && r >= 0 && c < cols && r < rows && ch !== " ") over[r * cols + c] = ch;
    };
    const text = (c: number, r: number, s: string) => { for (let i = 0; i < s.length; i++) put(c + i, r, s[i]); };
    const art = (c: number, r: number, lines: readonly string[]) => lines.forEach((l, i) => text(c, r + i, l));
    const light = (c: number, r: number, v: number) => {
      c = Math.round(c); r = Math.round(r);
      if (c >= 0 && r >= 0 && c < cols && r < rows) { const i = r * cols + c; if (v > buf[i]) buf[i] = v; }
    };
    const glow = (cx: number, cy: number, radius: number, v: number) => {
      const rr = Math.ceil(radius / asp) + 1;
      for (let r = Math.floor(cy) - rr; r <= Math.ceil(cy) + rr; r++)
        for (let c = Math.floor(cx - radius) - 1; c <= Math.ceil(cx + radius) + 1; c++) {
          const d = Math.hypot(c - cx, (r - cy) * asp) / radius;
          if (d < 1) light(c, r, v * (1 - d * d));
        }
    };

    // Pointer: fish scatter away from the cursor.
    const mouse = { x: -999, y: -999 };
    const onMove = (e: PointerEvent) => {
      const b = host.getBoundingClientRect();
      mouse.x = (e.clientX - b.left) / charW;
      mouse.y = (e.clientY - b.top) / charH;
    };

    const start = performance.now();
    let prev = start, raf = 0, visible = false, bubbleAcc = 0;

    const frame = (now: number, simulate: boolean) => {
      const dt = Math.min(0.15, (now - prev) / 1000);
      prev = now;
      const t = (now - start) / 1000;
      buf.fill(0);
      over.fill("");

      // Light rays from the surface.
      if (cfg.rays > 0) {
        for (let r = 0; r < rows; r++) {
          const fade = Math.max(0, 1 - r / (rows * 0.9));
          if (fade <= 0) continue;
          for (let c = 0; c < cols; c++) {
            const s = c + r * 0.55;
            const ray = Math.max(0, Math.sin(s * 0.045 + t * 0.12) * Math.sin(s * 0.021 - t * 0.08 + 1));
            const v = ray * ray * 0.24 * cfg.rays * fade;
            if (v > 0.01) buf[r * cols + c] = v;
          }
        }
      }

      // Sand.
      if (cfg.sand) {
        for (let c = 0; c < cols; c++) {
          const top = rows - 2.2 + Math.sin(c * 0.08) * 0.8;
          for (let r = Math.floor(top); r < rows; r++) light(c, r, r === Math.floor(top) ? 0.45 : 0.18 + ((c * 7 + r * 13) % 5) * 0.03);
        }
      }

      // Marine snow.
      for (const s of snow) {
        if (simulate) { s.y += s.v * dt; s.x += Math.sin(t * 0.4 + s.phase) * 0.15 * dt; if (s.y > rows) { s.y = 0; s.x = rand(0, cols); } }
        light(s.x, s.y, 0.28);
      }

      // Bioluminescent glows.
      for (const g of glows) {
        const pulse = 0.5 + 0.5 * Math.sin(t * g.v + g.phase);
        if (simulate) { g.x += Math.sin(t * 0.2 + g.phase) * 0.3 * dt; g.y += Math.cos(t * 0.15 + g.phase) * 0.15 * dt; }
        glow(g.x, g.y, 2 + pulse * 2.4, 0.3 + pulse * 0.7);
      }

      // Treasure glints.
      for (const k of coins) {
        const tw = Math.max(0, Math.sin(t * k.v + k.phase));
        if (tw > 0.85) put(k.x, k.y, tw > 0.97 ? "*" : "+");
        else if (tw > 0.5) put(k.x, k.y, ".");
      }

      // Kelp.
      for (const k of kelp) {
        const h = Math.round(k.y);
        for (let i = 0; i <= h; i++) {
          const f = i / h;
          const sway = Math.sin(t * k.v + i * 0.3 + k.phase);
          const x = k.x + sway * 2 * f;
          put(x, rows - 1 - i, sway > 0.2 ? ")" : sway < -0.2 ? "(" : "|");
          if (i % 4 === 2 && f < 0.9) put(x + (sway > 0 ? 1 : -1), rows - 1 - i, "~");
        }
      }

      // Props.
      for (const sp of cfg.sprites) {
        const w = Math.max(...sp.art.map((l) => l.length));
        const c = Math.round(Math.min(cols - w - 1, Math.max(1, sp.x * cols - w / 2)));
        art(c, rows - sp.bottom - sp.art.length, sp.art);
      }
      if (cfg.vents) {
        for (const vx of vents) {
          art(vx - 3, rows - 3 - 1, VENT);
          glow(vx, rows - 4, 3 + Math.sin(t * 2 + vx) * 0.8, 0.7);
          if (simulate && Math.random() < dt * 3) bubbles.push({ x: vx + rand(-1, 1), y: rows - 5, v: rand(3, 6), phase: rand(0, 6) });
        }
      }

      // Bubbles.
      if (simulate && cfg.bubbles > 0) {
        bubbleAcc += dt * cfg.bubbles;
        while (bubbleAcc > 1) { bubbleAcc -= 1; bubbles.push({ x: rand(0, cols), y: rows, v: rand(2, 5), phase: rand(0, 6) }); }
      }
      bubbles = bubbles.filter((b) => b.y > -1);
      for (const b of bubbles) {
        if (simulate) { b.y -= b.v * dt; b.x += Math.sin(t * 2 + b.phase) * 0.1; }
        put(b.x, b.y, b.v > 4.2 ? "O" : b.v > 3 ? "o" : ".");
      }

      // Jellyfish.
      for (const j of jellies) {
        const pulse = Math.sin(t * 2 * j.v + j.phase);
        if (simulate) { j.y -= Math.max(0, -Math.cos(t * 2 * j.v + j.phase)) * 1.4 * dt - 0.25 * dt; j.x += Math.sin(t * 0.3 + j.phase) * 0.4 * dt; if (j.y < -4) { j.y = rows + 2; j.x = rand(cols * 0.05, cols * 0.95); } }
        glow(j.x + 5, j.y + 2, 6 + pulse, 0.45);
        art(j.x, j.y, pulse > 0 ? JELLY_A : JELLY_B);
      }

      // Anglerfish with a glowing lure.
      if (cfg.angler) {
        if (simulate) {
          angler.x += angler.dir * 1.6 * dt;
          angler.y += Math.sin(t * 0.5) * 0.25 * dt;
          if (angler.x > cols - 14) angler.dir = -1;
          if (angler.x < 2) angler.dir = 1;
        }
        const lines = angler.dir > 0 ? ANGLER.map((l) => [...l].reverse().join("").replace(/[/\\()<>]/g, (ch) => ({ "/": "\\", "\\": "/", "(": ")", ")": "(", "<": ">", ">": "<" })[ch] as string)) : ANGLER;
        art(angler.x, angler.y, lines);
        const lureX = angler.dir > 0 ? angler.x + 3 : angler.x + 8;
        glow(lureX, angler.y, 2.6 + Math.sin(t * 3) * 0.8, 0.95);
      }

      // Crab scuttling on the sand.
      if (cfg.crab) {
        if (simulate) {
          crab.x += crab.dir * 4 * dt;
          if (crab.x > cols - 18) crab.dir = -1;
          if (crab.x < 2) crab.dir = 1;
        }
        text(crab.x, rows - 3, Math.floor(t * 6) % 2 ? CRAB_A : CRAB_B);
      }

      // Tiny fish (scatter from the cursor).
      for (const f of fish) {
        if (simulate) {
          const dx = f.x - mouse.x, dy = (f.y - mouse.y) * 2;
          if (Math.hypot(dx, dy) < 10) { f.dir = dx >= 0 ? 1 : -1; f.boost = 1; }
          f.boost = Math.max(0, f.boost - dt);
          f.x += f.dir * f.speed * (1 + f.boost * 4) * dt;
          f.y += Math.sin(t * 1.3 + f.phase) * 0.4 * dt;
          if (f.x > cols + 8) { f.x = -8; f.y = rand(rows * 0.1, rows * 0.8); }
          if (f.x < -8) { f.x = cols + 8; f.y = rand(rows * 0.1, rows * 0.8); }
        }
        text(f.x, f.y, (f.dir > 0 ? FISH_R : FISH_L)[f.kind]);
      }

      // Compose: sprites win, the rest is ordered-dithered.
      const n = RAMP.length - 1;
      const out: string[] = new Array(rows);
      for (let r = 0; r < rows; r++) {
        let line = "";
        const brow = (r & 3) * 4;
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          if (over[i]) { line += over[i]; continue; }
          const q = Math.min(1, buf[i]) * n;
          const lo = Math.floor(q);
          line += RAMP[Math.min(n, lo + (q - lo > BAYER4[brow + (c & 3)] ? 1 : 0))];
        }
        out[r] = line;
      }
      pre.textContent = out.join("\n");
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - prev < 1000 / FPS) return;
      frame(now, true);
    };

    measure();
    frame(performance.now(), false);
    const ro = new ResizeObserver(() => { measure(); frame(performance.now(), false); });
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; prev = performance.now(); }, { rootMargin: "120px" });
    io.observe(host);
    if (!reduce) {
      raf = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onMove, { passive: true });
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [zone]);

  const z = ZONES[zone];
  return (
    <>
      <pre
        ref={preRef}
        aria-hidden="true"
        className="ascii-backdrop pointer-events-none absolute inset-0 -z-10 m-0 overflow-hidden font-mono text-[11px] leading-[1.15] select-none"
        style={{ backgroundImage: z.cfg.ink, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
      />
      <p aria-hidden className="pointer-events-none absolute top-4 left-5 z-0 font-pixel text-[7px] tracking-widest text-muted sm:top-6 sm:left-8 sm:text-[8px]">
        ▼ {z.depth} · {z.name}
      </p>
    </>
  );
}
