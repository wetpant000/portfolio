"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

/*
 * BUG HUNT — a silly 30-second mini-game.
 * Squash bugs (+10, combos give bonus), golden bugs (+50).
 * Don't squash the features (-25). Bugs that wander off "escape to prod".
 */

type Kind = "bug" | "golden" | "feature";
type Ent = { id: number; x: number; y: number; vx: number; vy: number; kind: Kind; born: number; life: number };
type Pop = { id: number; x: number; y: number; text: string; color: string; born: number };
type Splat = { id: number; x: number; y: number; born: number; color: string };

const DURATION = 30; // seconds
const BEST_KEY = "bughunt-best";

const COMBO_LINES: Record<number, string> = {
  3: "TRIPLE SQUASH!",
  5: "NO BUGS IN PROD",
  8: "10x DEVELOPER",
  12: "THE COMPILER FEARS YOU",
};
const FEATURE_LINES = ["IT WAS A FEATURE!", "PM IS TYPING…", "WORKS ON MY MACHINE?", "REVERT! REVERT!"];

function rank(score: number) {
  if (score < 50) return "INTERN WHO PUSHED TO MAIN";
  if (score < 150) return "JUNIOR BUG HUNTER";
  if (score < 300) return "SENIOR SQUASHER";
  if (score < 500) return "STAFF DEBUGGER";
  return "LEGENDARY 10x ENGINEER";
}

// 8x8 pixel sprites ("X" = filled). Two bug frames make the legs scuttle.
// 9x9 beetle: antennae, head, split shell, legs (two frames so it scuttles).
const BUG_A = [".X.....X.", "..X...X..", "...XXX...", "X.XX.XX.X", ".XXX.XXX.", "X.XX.XX.X", ".XXX.XXX.", "X.XX.XX.X", "..XX.XX.."];
const BUG_B = ["X.......X", ".X.....X.", "...XXX...", ".XXX.XXX.", "X.XX.XX.X", ".XXX.XXX.", "X.XX.XX.X", ".XXX.XXX.", "..XX.XX.."];
const FEATURE = ["XXXXXXXX", "X......X", "X.....XX", "X....X.X", "XX..X..X", "X.XX...X", "X......X", "XXXXXXXX"];
const SPLAT = ["X..X..X.", ".X.XX.X.", "..XXXX..", "XXXXXXXX", ".XXXXXX.", "..XXXX..", ".X.XX.X.", "X..X...X"];

function Sprite({ rows, color, className }: { rows: string[]; color: string; className?: string }) {
  return (
    <svg viewBox={`0 0 ${rows[0].length} ${rows.length}`} shapeRendering="crispEdges" className={className} aria-hidden>
      {rows.flatMap((row, y) =>
        [...row].map((c, x) => (c === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} /> : null)),
      )}
    </svg>
  );
}

const COLOR: Record<Kind, string> = { bug: "var(--rose)", golden: "var(--gold)", feature: "var(--accent)" };

export default function BugHunt() {
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [escaped, setEscaped] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [shout, setShout] = useState<{ text: string; id: number } | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [, rerender] = useReducer((x: number) => x + 1, 0);

  const ents = useRef<Ent[]>([]);
  const pops = useRef<Pop[]>([]);
  const splats = useRef<Splat[]>([]);
  const combo = useRef({ n: 0, last: 0 });
  const nextId = useRef(1);
  const scoreRef = useRef(0);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(BEST_KEY)) || 0);
    } catch {}
  }, []);

  const say = (text: string) => setShout({ text, id: nextId.current++ });

  const spawn = (elapsed: number, now: number) => {
    const r = Math.random();
    const kind: Kind = r < 0.08 ? "golden" : r < 0.3 ? "feature" : "bug";
    const speed = kind === "golden" ? 38 : kind === "feature" ? 10 : 14 + elapsed * 0.7 + Math.random() * 8;
    const edge = Math.floor(Math.random() * 4);
    const x = edge === 0 ? 2 : edge === 1 ? 98 : 5 + Math.random() * 90;
    const y = edge === 2 ? 3 : edge === 3 ? 97 : 8 + Math.random() * 84;
    // Head roughly toward the middle so it crosses the arena.
    const ang = Math.atan2(50 - y + (Math.random() - 0.5) * 60, 50 - x + (Math.random() - 0.5) * 60);
    ents.current.push({
      id: nextId.current++,
      x,
      y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      kind,
      born: now,
      life: kind === "golden" ? 2600 : kind === "feature" ? 5200 : 4800,
    });
  };

  // Game loop.
  useEffect(() => {
    if (phase !== "play") return;
    const start = performance.now();
    let last = start;
    let spawnAcc = 0.6;
    let raf = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const elapsed = (now - start) / 1000;
      const left = Math.max(0, DURATION - elapsed);

      spawnAcc += dt;
      const interval = Math.max(0.3, 0.85 - elapsed * 0.018);
      if (spawnAcc > interval && ents.current.length < 14) {
        spawnAcc = 0;
        spawn(elapsed, now);
      }

      for (const e of ents.current) {
        // Random wiggles: bugs change direction now and then.
        if (Math.random() < dt * (e.kind === "golden" ? 3 : 1.4)) {
          const sp = Math.hypot(e.vx, e.vy);
          const ang = Math.atan2(e.vy, e.vx) + (Math.random() - 0.5) * 2;
          e.vx = Math.cos(ang) * sp;
          e.vy = Math.sin(ang) * sp;
        }
        e.x += e.vx * dt;
        e.y += e.vy * dt * 1.6; // arena is wider than tall
        if (e.x < 2 || e.x > 98) e.vx *= -1;
        if (e.y < 4 || e.y > 96) e.vy *= -1;
        e.x = Math.min(98, Math.max(2, e.x));
        e.y = Math.min(96, Math.max(4, e.y));
      }
      const gone = ents.current.filter((e) => now - e.born >= e.life);
      if (gone.length) {
        const bugsOut = gone.filter((e) => e.kind !== "feature").length;
        if (bugsOut) setEscaped((n) => n + bugsOut);
        ents.current = ents.current.filter((e) => now - e.born < e.life);
      }
      pops.current = pops.current.filter((p) => now - p.born < 800);
      splats.current = splats.current.filter((s) => now - s.born < 1400);

      setTimeLeft(left);
      rerender();
      if (left <= 0) {
        ents.current = [];
        setPhase("over");
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // Save the high score when a round ends.
  useEffect(() => {
    if (phase !== "over") return;
    const s = scoreRef.current;
    if (s > best) {
      setBest(s);
      setNewBest(true);
      try {
        localStorage.setItem(BEST_KEY, String(s));
      } catch {}
    }
  }, [phase, best]);

  const start = useCallback(() => {
    ents.current = [];
    pops.current = [];
    splats.current = [];
    combo.current = { n: 0, last: 0 };
    scoreRef.current = 0;
    setScore(0);
    setEscaped(0);
    setTimeLeft(DURATION);
    setNewBest(false);
    setShout(null);
    setPhase("play");
  }, []);

  const squash = (e: Ent, ev: React.PointerEvent) => {
    ev.stopPropagation();
    const now = performance.now();
    ents.current = ents.current.filter((x) => x.id !== e.id);
    let pts: number;
    if (e.kind === "feature") {
      pts = -25;
      combo.current.n = 0;
      say(FEATURE_LINES[Math.floor(Math.random() * FEATURE_LINES.length)]);
    } else {
      combo.current.n = now - combo.current.last < 1000 ? combo.current.n + 1 : 1;
      combo.current.last = now;
      const bonus = (combo.current.n - 1) * 2;
      pts = (e.kind === "golden" ? 50 : 10) + bonus;
      if (e.kind === "golden") say("GOLDEN BUG! +50");
      else if (COMBO_LINES[combo.current.n]) say(COMBO_LINES[combo.current.n]);
    }
    scoreRef.current = Math.max(0, scoreRef.current + pts);
    setScore(scoreRef.current);
    pops.current.push({ id: nextId.current++, x: e.x, y: e.y, text: pts > 0 ? `+${pts}` : `${pts}`, color: pts > 0 ? COLOR[e.kind] : "var(--rose)", born: now });
    splats.current.push({ id: nextId.current++, x: e.x, y: e.y, born: now, color: COLOR[e.kind] });
  };

  const miss = () => {
    if (phase === "play") combo.current.n = 0;
  };

  const frame = Math.floor((typeof performance !== "undefined" ? performance.now() : 0) / 120) % 2;

  return (
    <div className="pixel-box p-4 sm:p-6">
      {/* Scoreboard */}
      <div className="mb-4 grid grid-cols-2 gap-3 font-pixel text-[8px] sm:grid-cols-4">
        <span>
          SCORE <span className="text-accent">{score}</span>
        </span>
        <span>
          BEST <span className="text-gold">{best}</span>
        </span>
        <span>
          ESCAPED TO PROD <span className="text-rose">{escaped}</span>
        </span>
        <span className="flex items-center gap-2">
          TIME
          <span className="xp-track flex-1 !h-[8px]">
            <span className="xp-live block" style={{ width: `${(timeLeft / DURATION) * 100}%`, background: timeLeft < 6 ? "var(--rose)" : undefined }} />
          </span>
        </span>
      </div>

      {/* Arena */}
      <div
        onPointerDown={miss}
        className="relative aspect-[4/5] w-full touch-manipulation overflow-hidden border-4 border-line select-none sm:aspect-[16/8]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0 23px, color-mix(in srgb, var(--foreground) 5%, transparent) 23px 24px), repeating-linear-gradient(90deg, transparent 0 23px, color-mix(in srgb, var(--foreground) 5%, transparent) 23px 24px), var(--background)",
          cursor: phase === "play" ? "crosshair" : "default",
        }}
      >
        {splats.current.map((s) => (
          <span
            key={s.id}
            className="splat absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            <Sprite rows={SPLAT} color={s.color} className="h-full w-full opacity-60" />
          </span>
        ))}

        {ents.current.map((e) => {
          const deg = (Math.atan2(e.vy, e.vx) * 180) / Math.PI + 90;
          return (
            <button
              key={e.id}
              type="button"
              aria-label={e.kind === "feature" ? "a feature (don't squash!)" : e.kind === "golden" ? "golden bug" : "bug"}
              onPointerDown={(ev) => squash(e, ev)}
              className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-crosshair items-center justify-center"
              style={{ left: `${e.x}%`, top: `${e.y}%` }}
            >
              {e.kind === "feature" ? (
                <span className="flex flex-col items-center">
                  <Sprite rows={FEATURE} color={COLOR.feature} className="h-7 w-7" />
                  <span className="mt-0.5 font-pixel text-[5px] text-accent">FEATURE</span>
                </span>
              ) : (
                <span style={{ transform: `rotate(${deg}deg)` }} className="block">
                  <Sprite
                    rows={(frame + e.id) % 2 ? BUG_A : BUG_B}
                    color={COLOR[e.kind]}
                    className={e.kind === "golden" ? "h-9 w-9 drop-shadow-[0_0_6px_var(--gold)]" : "h-8 w-8"}
                  />
                </span>
              )}
            </button>
          );
        })}

        {pops.current.map((p) => (
          <span
            key={p.id}
            className="score-pop pointer-events-none absolute -translate-x-1/2 font-pixel text-[10px]"
            style={{ left: `${p.x}%`, top: `${p.y}%`, color: p.color }}
          >
            {p.text}
          </span>
        ))}

        {shout && phase === "play" && (
          <p key={shout.id} className="shout pointer-events-none absolute inset-x-0 top-[14%] text-center font-pixel text-sm text-gold sm:text-lg">
            {shout.text}
          </p>
        )}

        {phase !== "play" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-background/80 p-6 text-center backdrop-blur-[2px]">
            {phase === "idle" ? (
              <>
                <div className="flex items-end gap-4">
                  <Sprite rows={BUG_A} color="var(--rose)" className="h-10 w-10" />
                  <Sprite rows={BUG_A} color="var(--gold)" className="h-12 w-12" />
                  <Sprite rows={FEATURE} color="var(--accent)" className="h-10 w-10" />
                </div>
                <p className="font-pixel text-base text-foreground sm:text-xl">BUG HUNT</p>
                <ul className="space-y-1.5 text-sm text-muted">
                  <li>
                    Squash <span className="text-rose">bugs</span> +10 · <span className="text-gold">golden bugs</span> +50
                  </li>
                  <li>
                    Don&apos;t squash the <span className="text-accent">features</span> −25
                  </li>
                  <li>Quick squashes build a combo. You have {DURATION} seconds.</li>
                </ul>
              </>
            ) : (
              <>
                <p className="font-pixel text-base text-rose sm:text-xl">TIME&apos;S UP!</p>
                <p className="font-pixel text-2xl text-accent sm:text-4xl">{score}</p>
                {newBest && <p className="blink font-pixel text-[9px] text-gold">★ NEW HIGH SCORE ★</p>}
                <p className="text-sm text-muted">
                  Rank: <span className="font-semibold text-foreground">{rank(score)}</span>
                  <br />
                  {escaped} bug{escaped === 1 ? "" : "s"} escaped to production.
                </p>
              </>
            )}
            <button type="button" onClick={start} className="pixel-btn">
              <span className="blink">▶</span> {phase === "idle" ? "Start" : "Play again"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
