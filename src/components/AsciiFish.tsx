"use client";

import { useEffect, useRef } from "react";

/*
 * Dithered ASCII aquarium.
 *
 * Every frame the scene is painted into a brightness buffer (0..1 per cell):
 * water gradient + light rays, marine snow, seaweed, sand, and the animals
 * (fish, jellyfish, a turtle, a crab). The buffer is then converted to
 * characters with ordered (Bayer 4x4) dithering, which gives soft gradients
 * that classic dotted dither texture.
 *
 * Coordinates: x = column, y = row. Characters are ~2x taller than wide, so
 * shapes are evaluated in "X-units" where dy_x = dy_rows * asp.
 */

const RAMP = " .:-+*#%@";
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const FPS = 30;

type Bubble = { x: number; y: number; r: number; vy: number; phase: number };

type Fish = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  L: number; // half body length (X-units)
  maxSpeed: number;
  facing: number; // cos(yaw): 1 = facing right, -1 = facing left
  yaw: number; // 0 = right, PI = left
  yawVel: number;
  want: number; // direction it has committed to (-1 | 1)
  wantSince: number;
  swim: number; // tail-beat phase
  leader: boolean;
  tx: number;
  ty: number;
  nextPick: number;
  dartUntil: number;
  lastBubble: number;
};

type Jelly = { x: number; y: number; R: number; phase: number; speed: number; seed: number };
type Turtle = { x: number; y: number; L: number; dir: number; speed: number; phase: number };
type Crab = { x: number; vx: number; s: number; phase: number; nextMove: number; target: number };
type Weed = { x: number; h: number; phase: number };
type Snow = { x: number; y: number; vy: number; vx: number };

export default function AsciiFish() {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    // ---------- Grid ----------
    let cols = 0;
    let rows = 0;
    let charW = 8;
    let charH = 16;
    let asp = 2;
    let buf = new Float32Array(0);
    let over: string[] = [];

    const measure = () => {
      const probe = document.createElement("span");
      probe.textContent = "M".repeat(100);
      probe.style.visibility = "hidden";
      pre.appendChild(probe);
      const rect = probe.getBoundingClientRect();
      charW = rect.width / 100;
      pre.removeChild(probe);
      // Row pitch is the line-height, not the glyph box height.
      const lh = parseFloat(getComputedStyle(pre).lineHeight);
      charH = Number.isFinite(lh) ? lh : rect.height;
      const box = pre.parentElement!.getBoundingClientRect();
      cols = Math.max(20, Math.floor(box.width / charW));
      rows = Math.max(10, Math.floor(box.height / charH));
      asp = charH / charW;
      buf = new Float32Array(cols * rows);
      over = new Array(cols * rows).fill("");
    };
    measure();

    const put = (c: number, r: number, v: number) => {
      c = Math.round(c);
      r = Math.round(r);
      if (c < 0 || r < 0 || c >= cols || r >= rows) return;
      buf[r * cols + c] = v;
    };
    const lighten = (c: number, r: number, v: number) => {
      c = Math.round(c);
      r = Math.round(r);
      if (c < 0 || r < 0 || c >= cols || r >= rows) return;
      const i = r * cols + c;
      if (v > buf[i]) buf[i] = v;
    };
    const blend = (c: number, r: number, v: number, a: number) => {
      if (c < 0 || r < 0 || c >= cols || r >= rows) return;
      const i = r * cols + c;
      buf[i] = buf[i] * (1 - a) + v * a;
    };
    const line = (x0: number, y0: number, x1: number, y1: number, v: number) => {
      const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2) + 1;
      for (let i = 0; i <= n; i++) {
        const k = i / n;
        put(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, v);
      }
    };
    const hash = (a: number, b: number) => {
      const n = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
      return n - Math.floor(n);
    };

    // Seabed height (row of the sand surface) per column.
    const bedTop = (c: number) => rows - 3.2 + Math.sin(c * 0.07) * 1.1 + Math.sin(c * 0.19 + 1) * 0.6;

    // ---------- Creatures ----------
    const bigL = () => Math.min(cols * 0.2, 42);

    const makeFish = (scale: number, leader: boolean): Fish => {
      const startDir = Math.random() < 0.5 ? -1 : 1;
      const x = leader ? cols * 0.5 : rand(cols * 0.1, cols * 0.9);
      const y = leader ? rows * 0.42 : rand(rows * 0.15, rows * 0.7);
      return {
        x, y, vx: rand(-2, 2), vy: 0,
        L: Math.max(5, bigL() * scale),
        maxSpeed: leader ? 22 : 14 + (1 - scale) * 30,
        facing: startDir, yaw: startDir > 0 ? 0 : Math.PI, yawVel: 0, want: startDir, wantSince: 0,
        swim: rand(0, 10), leader,
        tx: x, ty: y, nextPick: 0, dartUntil: 0, lastBubble: rand(0, 2),
      };
    };
    const SMALL_SCALES = [0.38, 0.3, 0.24, 0.17];
    const LEADER_SCALE = 0.68;
    const school: Fish[] = [makeFish(LEADER_SCALE, true), ...SMALL_SCALES.map((s) => makeFish(s, false))];

    const jellies: Jelly[] = [0, 1].map((i) => ({
      x: cols * (i === 0 ? 0.78 : 0.2),
      y: rows * (i === 0 ? 0.35 : 0.6),
      R: Math.max(4, bigL() * (i === 0 ? 0.2 : 0.14)),
      phase: rand(0, 6),
      speed: rand(1.8, 2.6),
      seed: rand(0, 100),
    }));

    const turtle: Turtle = { x: cols * 0.15, y: rows * 0.3, L: Math.max(6, bigL() * 0.36), dir: 1, speed: 5, phase: 0 };

    const crab: Crab = { x: cols * 0.8, vx: 0, s: Math.max(3, bigL() * 0.15), phase: 0, nextMove: 0, target: cols * 0.8 };

    let weeds: Weed[] = [];
    const plantWeeds = () => {
      weeds = [];
      const n = Math.max(4, Math.round(cols / 22));
      for (let i = 0; i < n; i++) {
        weeds.push({ x: (i + rand(0.2, 0.8)) * (cols / n), h: rand(rows * 0.12, rows * 0.32), phase: rand(0, 6) });
      }
    };
    plantWeeds();

    const snow: Snow[] = Array.from({ length: 50 }, () => ({
      x: rand(0, cols), y: rand(0, rows), vy: rand(0.4, 1.4), vx: rand(-0.3, 0.3),
    }));

    let bubbles: Bubble[] = [];
    const mouse = { x: 0, y: 0, active: false, last: 0 };

    const onMove = (e: PointerEvent) => {
      const box = pre.getBoundingClientRect();
      mouse.x = (e.clientX - box.left) / charW;
      mouse.y = (e.clientY - box.top) / charH;
      mouse.active = true;
      mouse.last = performance.now();
    };
    const onResize = () => {
      measure();
      school.forEach((f, i) => {
        f.L = Math.max(5, bigL() * (i === 0 ? LEADER_SCALE : SMALL_SCALES[i - 1]));
        f.x = Math.min(f.x, cols);
        f.y = Math.min(f.y, rows);
      });
      turtle.L = Math.max(6, bigL() * 0.36);
      crab.s = Math.max(3, bigL() * 0.15);
      crab.x = Math.min(crab.x, cols * 0.9);
      plantWeeds();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("resize", onResize);

    // ---------- Behaviour ----------
    const steerFish = (f: Fish, t: number, dt: number) => {
      let ax = 0;
      let ay = 0;

      if (f.leader) {
        const following = mouse.active;
        const tx = following ? mouse.x : cols * (0.5 + 0.3 * Math.sin(t * 0.17));
        const ty = following ? mouse.y : rows * (0.42 + 0.14 * Math.sin(t * 0.31 + 1.3));
        ax += (tx - f.x) * (following ? 2.2 : 0.8);
        ay += (ty - f.y) * 2 * (following ? 2.2 : 0.8);
      } else {
        if (t > f.nextPick || Math.hypot(f.tx - f.x, (f.ty - f.y) * 2) < 3) {
          f.tx = rand(cols * 0.05, cols * 0.95);
          f.ty = rand(rows * 0.1, rows * 0.75);
          f.nextPick = t + rand(2, 6);
          if (Math.random() < 0.35) f.dartUntil = t + rand(0.4, 0.9);
        }
        const dx = f.tx - f.x;
        const dy = (f.ty - f.y) * 2;
        const d = Math.hypot(dx, dy) || 1;
        ax += (dx / d) * 18;
        ay += (dy / d) * 18 + Math.sin(t * 2.3 + f.swim * 0.1) * 6;

        if (mouse.active) {
          const mx = f.x - mouse.x;
          const my = (f.y - mouse.y) * 2;
          const md = Math.hypot(mx, my);
          const R = 18 + f.L * 2;
          if (md < R) {
            const push = (1 - md / R) * 140;
            ax += (mx / (md || 1)) * push;
            ay += (my / (md || 1)) * push;
            f.dartUntil = Math.max(f.dartUntil, t + 0.3);
          }
        }
      }

      // Personal space from other fish and the turtle.
      const others: { x: number; y: number; L: number }[] = [...school, turtle];
      for (const o of others) {
        if (o === f) continue;
        const sx = f.x - o.x;
        const sy = (f.y - o.y) * 2;
        const sd = Math.hypot(sx, sy);
        const R = (f.L + o.L) * 1.25;
        if (sd < R && sd > 0.01) {
          const k = (1 - sd / R) * 140 * (o.L / (f.L + o.L)) * 2;
          ax += (sx / sd) * k;
          ay += (sy / sd) * k;
        }
      }

      // Soft walls (stay above the seabed).
      const m = f.L * 0.6;
      if (f.x < m) ax += (m - f.x) * 4;
      if (f.x > cols - m) ax -= (f.x - (cols - m)) * 4;
      if (f.y < 2) ay += (2 - f.y) * 8;
      const floor = rows - 6 - f.L * 0.35;
      if (f.y > floor) ay -= (f.y - floor) * 8;

      f.vx += ax * dt;
      f.vy += (ay / 2) * dt;
      const drag = Math.pow(0.35, dt);
      f.vx *= drag;
      f.vy *= drag;
      const cap = f.maxSpeed * (t < f.dartUntil ? 2.4 : 1);
      const sp = Math.hypot(f.vx, f.vy * 2);
      if (sp > cap) {
        f.vx *= cap / sp;
        f.vy *= cap / sp;
      }
      // Commit to a new direction only after the urge persists briefly
      // (stops flip-flopping when the target is nearly straight above/below).
      const wantNow = ax > 6 ? 1 : ax < -6 ? -1 : f.want;
      if (wantNow === f.want) f.wantSince = t;
      else if (t - f.wantSince > 0.2) {
        f.want = wantNow;
        f.wantSince = t;
      }

      // Rotate with a critically damped spring: eases in, eases out, no overshoot.
      const targetYaw = f.want > 0 ? 0 : Math.PI;
      const k = f.leader ? 20 : 40;
      f.yawVel += ((targetYaw - f.yaw) * k - f.yawVel * 2 * Math.sqrt(k)) * dt;
      f.yaw += f.yawVel * dt;
      f.facing = Math.cos(f.yaw);

      // A fish can't swim backwards: brake while it turns, then it accelerates
      // out of the turn. A gentle rise/dip makes the U-turn an arc.
      const heading = f.facing >= 0 ? 1 : -1;
      if (f.vx * heading < 0) f.vx *= Math.pow(0.04, dt);
      f.vx *= 1 - 0.6 * (1 - Math.abs(f.facing)) * dt * 4;
      f.vy -= Math.sin(f.yaw) * Math.sign(f.yawVel) * f.want * 2.5 * dt;

      f.x += f.vx * dt;
      f.y += f.vy * dt;
      const speed01 = Math.min(1, sp / f.maxSpeed);
      f.swim += dt * (4 + speed01 * 10) * (f.leader ? 1 : 1.6);

      if (t - f.lastBubble > (f.leader ? rand(0.6, 1.8) : rand(2.5, 6))) {
        f.lastBubble = t;
        const dir = Math.sign(f.facing) || 1;
        bubbles.push({ x: f.x + dir * f.L * 1.02, y: f.y - 0.5, r: f.leader && Math.random() < 0.3 ? 2 : 1, vy: rand(3, 6), phase: rand(0, 6) });
      }
    };

    const updateOthers = (t: number, dt: number) => {
      // Jellyfish: rise on each bell contraction, sink slowly, respawn below.
      for (const j of jellies) {
        j.phase += dt * j.speed;
        const contracting = Math.max(0, -Math.cos(j.phase));
        j.y += (-contracting * j.R * 0.45 + 0.7) * dt;
        j.x += Math.sin(t * 0.2 + j.seed) * 0.6 * dt;
        if (j.y < -j.R * 2.5) {
          j.y = rows + j.R;
          j.x = rand(cols * 0.1, cols * 0.9);
        }
      }

      // Turtle: glides across, wraps around, picks a new lane each pass.
      turtle.phase += dt * 1.5;
      turtle.x += turtle.dir * turtle.speed * dt;
      turtle.y += Math.sin(t * 0.35) * 0.6 * dt;
      const off = turtle.L * 3;
      if ((turtle.dir > 0 && turtle.x > cols + off) || (turtle.dir < 0 && turtle.x < -off)) {
        turtle.dir = Math.random() < 0.5 ? 1 : -1;
        turtle.x = turtle.dir > 0 ? -off : cols + off;
        turtle.y = rand(rows * 0.18, rows * 0.55);
      }

      // Crab: scuttles sideways between pauses on the right part of the seabed
      // (the left side is behind the intro text).
      if (t > crab.nextMove) {
        crab.target = rand(cols * 0.5, cols * 0.93);
        crab.nextMove = t + rand(2.5, 6);
      }
      const dx = crab.target - crab.x;
      crab.vx = Math.abs(dx) > 0.5 ? Math.sign(dx) * Math.min(9, Math.abs(dx) * 2) : 0;
      crab.x += crab.vx * dt;
      crab.phase += dt * (crab.vx !== 0 ? 14 : 2);

      for (const s of snow) {
        s.y += s.vy * dt;
        s.x += (s.vx + Math.sin(t * 0.5 + s.y * 0.2) * 0.2) * dt;
        if (s.y > rows) {
          s.y = -1;
          s.x = rand(0, cols);
        }
      }

      bubbles = bubbles.filter((b) => b.y > -2);
      for (const b of bubbles) {
        b.y -= b.vy * dt;
        b.x += Math.sin(t * 3 + b.phase) * 0.15;
      }
    };

    // ---------- Painting ----------
    const paintWater = (t: number) => {
      for (let r = 0; r < rows; r++) {
        const depth = r / rows;
        const base = 0.075 * Math.pow(1 - depth, 1.8);
        for (let c = 0; c < cols; c++) {
          // Slanted god rays that slowly shift.
          const s = c + r * 0.55;
          const ray = Math.max(0, Math.sin(s * 0.045 + t * 0.12) * Math.sin(s * 0.021 - t * 0.08 + 1));
          let v = base + ray * ray * 0.13 * (1 - depth) ** 1.5;
          // Caustic shimmer near the surface.
          if (r < 3) v += Math.max(0, Math.sin(c * 0.31 + t * 1.1) * Math.sin(c * 0.17 - t * 1.4)) * 0.18 * (1 - r / 3);
          buf[r * cols + c] = v;
        }
      }
      for (const s of snow) lighten(s.x, s.y, 0.3);
    };

    const paintWeeds = (t: number) => {
      for (const w of weeds) {
        const root = bedTop(w.x);
        const h = Math.round(w.h);
        for (let k = 0; k <= h; k++) {
          const f = k / h;
          const x = w.x + Math.sin(t * 1.1 + k * 0.35 + w.phase) * 2.2 * Math.pow(f, 1.2);
          const y = root - k;
          put(x, y, 0.75 - f * 0.25);
          if (f < 0.85) put(x + 1, y, 0.55 - f * 0.2); // stem thickness
          if (k % 3 === 1 && k < h - 1) put(x + (k % 6 === 1 ? 2 : -1), y, 0.5); // leaves
        }
      }
    };

    const paintSand = () => {
      for (let c = 0; c < cols; c++) {
        const top = bedTop(c);
        for (let r = Math.floor(top); r < rows; r++) {
          if (r < 0) continue;
          const surface = r === Math.floor(top);
          const v = surface ? 0.5 : 0.2 + hash(c, r) * 0.18 + (r - top) * 0.02;
          buf[r * cols + c] = v;
        }
      }
    };

    const paintJelly = (j: Jelly, t: number) => {
      const p = Math.sin(j.phase);
      const w = j.R * (1 + 0.15 * p);
      const hgt = j.R * 0.8 * (1 - 0.15 * p);
      const tentLen = j.R * 1.3;

      // Tentacles first, so the bell sits on top.
      const n = 6;
      for (let i = 0; i < n; i++) {
        const bx = j.x + (-0.85 + (1.7 * i) / (n - 1)) * w;
        for (let k = 0; k <= tentLen; k += 0.5) {
          const sway = Math.sin(t * 1.8 + k * 0.45 + i * 1.3) * (0.3 + k * 0.12);
          lighten(bx + sway, j.y + 0.6 + k, 0.55 * (1 - (k / tentLen) * 0.6));
        }
      }
      // Frilly oral arms.
      for (const side of [-1, 1]) {
        for (let k = 0; k <= tentLen * 0.6; k += 0.5) {
          const x = j.x + side * w * 0.18 + Math.sin(k * 0.9 + t * 2 + side) * 0.9;
          lighten(x, j.y + 0.6 + k, 0.75);
          lighten(x + 1, j.y + 0.6 + k, 0.6);
        }
      }

      // Translucent bell.
      const r0 = Math.floor(j.y - hgt / asp) - 1;
      for (let r = r0; r <= Math.ceil(j.y) + 1; r++) {
        for (let c = Math.floor(j.x - w) - 1; c <= Math.ceil(j.x + w) + 1; c++) {
          const nu = (c - j.x) / w;
          const nv = -((r - j.y) * asp) / hgt; // 0 at rim, 1 at top
          if (Math.abs(nu) >= 1) continue;
          const dome = Math.sqrt(1 - nu * nu);
          const scallop = -0.15 + 0.1 * Math.abs(Math.sin(nu * 9 + j.phase));
          if (nv > dome || nv < scallop) continue;
          const rr = Math.hypot(nu, nv);
          let v = 0.3 + 0.3 * nv;
          if (rr > 0.8 || nv < scallop + 0.12) v = 0.9; // rim
          else if (Math.abs(rr - 0.42) < 0.09 && Math.sin(Math.atan2(nv, nu) * 8) > 0) v = 0.75; // gonads
          blend(c, r, v, 0.85);
        }
      }
    };

    const paintTurtle = () => {
      const tu = turtle;
      const L = tu.L;
      const reachX = L * 2.3;
      const reachY = (L * 1.3) / asp;
      const front = Math.PI * 0.75 + Math.sin(tu.phase) * 0.7;
      const rear = Math.PI * 0.85 + Math.sin(tu.phase + 1) * 0.3;
      const fd = [Math.cos(front), Math.sin(front)];
      const rd = [Math.cos(rear), Math.sin(rear)];

      for (let r = Math.floor(tu.y - reachY); r <= Math.ceil(tu.y + reachY); r++) {
        for (let c = Math.floor(tu.x - reachX); c <= Math.ceil(tu.x + reachX); c++) {
          const u = ((c - tu.x) * tu.dir) / L;
          const v = ((r - tu.y) * asp) / L;
          let val = -1;

          // Flippers (behind the shell).
          const fx = u - 0.45;
          const fy = v - 0.1;
          const fa = fx * fd[0] + fy * fd[1];
          const fp = -fx * fd[1] + fy * fd[0];
          if (fa > 0 && fa < 1.0 && Math.abs(fp) < 0.17 * Math.sin((Math.PI * fa) / 1.0) + 0.03) val = 0.55;
          const rx = u + 0.7;
          const ry = v - 0.12;
          const ra = rx * rd[0] + ry * rd[1];
          const rp = -rx * rd[1] + ry * rd[0];
          if (ra > 0 && ra < 0.45 && Math.abs(rp) < 0.12 * Math.sin((Math.PI * ra) / 0.45) + 0.03) val = 0.5;

          // Head + neck.
          if (u > 0.85 && u < 1.05 && Math.abs(v - 0.02) < 0.13) val = 0.6;
          const hx = (u - 1.22) / 0.27;
          const hy = (v - 0.02) / 0.19;
          if (hx * hx + hy * hy < 1) {
            val = 0.72;
            if (Math.hypot(u - 1.3, v + 0.04) < 0.055) val = 0;
          }
          // Tail.
          if (u < -0.95 && u > -1.18 && Math.abs(v - 0.06) < 0.06 * (1 + u + 1.18) * 4) val = 0.5;

          // Shell (domed carapace, flat plastron).
          if (Math.abs(u) < 1) {
            const s = Math.sqrt(1 - u * u);
            const top = -0.62 * s;
            const bot = 0.18 * s;
            if (v > top && v < bot) {
              if (v > 0.06) val = 0.42;
              else {
                const rel = (v - top) / (0.06 - top);
                let b = 0.97 - rel * 0.35;
                const seam = Math.abs(Math.sin(u * 6.2 + Math.sin(v * 9) * 0.7)) < 0.2 || Math.abs(Math.sin(v * 5 + 0.6)) < 0.12;
                if (seam) b *= 0.45;
                if (v < top + 0.09) b = 0.4;
                val = b;
              }
            }
          }
          if (val >= 0) put(c, r, val);
        }
      }
    };

    const paintCrab = (t: number) => {
      const s = crab.s;
      const y = bedTop(crab.x) - 1.2;
      const x = crab.x;
      const bodyHalfH = s * 0.55; // X-units
      const rowUp = (xUnits: number) => xUnits / asp;

      // Legs: 3 per side, alternating lift while walking.
      for (const side of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          const lift = Math.max(0, Math.sin(crab.phase + i * 2.1 + (side > 0 ? Math.PI : 0))) * 0.8;
          const hipX = x + side * s * (0.45 + i * 0.2);
          const kneeX = x + side * s * (1.05 + i * 0.32);
          const footX = x + side * s * (1.25 + i * 0.38);
          line(hipX, y + 0.3, kneeX, y - 0.6 - lift, 0.5);
          line(kneeX, y - 0.6 - lift, footX, y + 1.1 - lift * 0.5, 0.5);
        }
      }

      // Claws on arms.
      const snap = 0.5 + 0.5 * Math.sin(t * 3);
      for (const side of [-1, 1]) {
        const cx = x + side * s * 1.65;
        const cy = y - rowUp(s * 1.2);
        line(x + side * s * 0.8, y - 0.3, cx - side * s * 0.3, cy + 0.4, 0.6);
        for (let r = Math.floor(cy - 2); r <= Math.ceil(cy + 2); r++) {
          for (let c = Math.floor(cx - s); c <= Math.ceil(cx + s); c++) {
            const lx = ((c - cx) * side) / (s * 0.5);
            const ly = ((r - cy) * asp) / (s * 0.42);
            if (lx * lx + ly * ly < 1) {
              const gap = lx > 0.1 && Math.abs(ly) < 0.15 + snap * 0.35;
              if (!gap) put(c, r, 0.85 - ly * 0.15);
            }
          }
        }
      }

      // Eye stalks.
      for (const side of [-1, 1]) {
        const ex = x + side * s * 0.32;
        line(ex, y - rowUp(bodyHalfH), ex, y - rowUp(bodyHalfH) - 1.2, 0.55);
        put(ex, y - rowUp(bodyHalfH) - 1.6, 0.95);
      }

      // Body: wide oval, flatter underside.
      for (let r = Math.floor(y - rowUp(bodyHalfH)) - 1; r <= Math.ceil(y + rowUp(bodyHalfH)) + 1; r++) {
        for (let c = Math.floor(x - s) - 1; c <= Math.ceil(x + s) + 1; c++) {
          const nx = (c - x) / s;
          const ny = ((r - y) * asp) / bodyHalfH;
          if (nx * nx + ny * ny < 1 && ny < 0.65) {
            let v = 0.9 - (ny + 1) * 0.22;
            if (hash(c, r) > 0.82) v -= 0.25; // speckles
            put(c, r, v);
          }
        }
      }
    };

    const paintFish = (f: Fish) => {
      const L = f.L;
      const H = L * 0.42;
      const dir = Math.sign(f.facing) || 1;
      const squash = 0.22 + 0.78 * Math.abs(f.facing); // foreshortened mid-turn
      const pitch = clamp((f.vy * 2) / (Math.abs(f.vx) + 8), -0.3, 0.3);
      const speed01 = Math.min(1, Math.hypot(f.vx, f.vy * 2) / f.maxSpeed);
      const amp = H * (0.12 + speed01 * 0.14);
      const reachX = L * 1.5 * squash + 1;
      const reachY = (H * 1.8) / asp + 1;

      for (let r = Math.floor(f.y - reachY); r <= Math.ceil(f.y + reachY); r++) {
        if (r < 0 || r >= rows) continue;
        for (let c = Math.floor(f.x - reachX); c <= Math.ceil(f.x + reachX); c++) {
          if (c < 0 || c >= cols) continue;
          const lx = ((c - f.x) * dir) / squash;
          const u = lx / L;
          const ly = (r - f.y) * asp - pitch * lx;
          const bend = amp * Math.sin(f.swim - u * 3) * Math.max(0, (1 - u) / 2) ** 1.5;
          const v = (ly - bend) / H;
          let val = -1;

          if (u > -1 && u < 1) {
            const taper = u > 0 ? Math.sqrt(1 - u * u) : Math.sqrt(1 - u * u) * (0.75 + 0.25 * (1 + u));
            const half = u > 0 ? taper : Math.max(taper, 0.24);
            if (Math.abs(v) < half) {
              const edge = Math.abs(v) / half;
              let d = 0.95 - edge * edge * 0.5 - (v / half) * 0.28;
              d += Math.sin(u * 22 - f.swim * 0.2) * Math.sin(v * 14 + u * 11) * 0.1;
              val = 0.3 + 0.7 * clamp(d, 0, 1);
              if (edge > 0.9) val = 0.22;
              if (Math.abs(u - 0.5) < Math.max(0.025, 0.45 / L) && edge < 0.8) val = 0.15;
              const eyeR = Math.max(0.55, L * 0.028);
              const ringR = eyeR + Math.max(0.6, L * 0.024);
              const ed = Math.hypot((u - 0.72) * L * squash, (v + 0.2) * H);
              if (ed < eyeR) val = 0;
              else if (ed < ringR) val = 1;
            }
          }
          if (val < 0 && u <= -0.95 && u > -1.45) {
            const k = -u - 0.95;
            const spread = 0.24 + k * 1.5;
            const fork = k > 0.28 ? (k - 0.28) * 2.2 : 0;
            const av = Math.abs(v);
            if (av < spread && av > fork * 0.9) {
              const rays = Math.sin(Math.atan2(v, k) * 9 + f.swim * 0.3);
              val = rays > 0.2 ? 0.75 : rays > -0.4 ? 0.45 : 0.28;
            }
          }
          if (val < 0) {
            const fu = (u + 0.1) / 0.45;
            if (fu > -1 && fu < 1) {
              const top = -Math.sqrt(Math.max(0, 1 - u * u)) * (u > 0 ? 1 : 0.75 + 0.25 * (1 + u));
              const finH = 0.32 * (1 - fu * fu) * (fu < 0 ? 1 : 0.55);
              if (v < top && v > top - finH) val = v < top - finH * 0.6 ? 0.3 : 0.5;
            }
            const pu = (u - 0.15) / 0.18;
            if (pu > -1 && pu < 1) {
              const bot = Math.sqrt(Math.max(0, 1 - u * u));
              if (v > bot && v < bot + 0.3 * (1 - pu * pu)) val = 0.5;
            }
          }
          if (val >= 0) buf[r * cols + c] = val;
        }
      }
    };

    // ---------- Main loop ----------
    const start = performance.now();
    let prev = start;
    let raf = 0;

    const frame = (now: number, simulate: boolean) => {
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      const t = (now - start) / 1000;

      if (mouse.active && now - mouse.last > 4000) mouse.active = false;
      if (simulate) {
        for (const f of school) steerFish(f, t, dt);
        updateOthers(t, dt);
      }

      over.fill("");
      paintWater(t);
      for (const j of jellies) paintJelly(j, t);
      paintWeeds(t);
      paintSand();
      paintCrab(t);
      paintTurtle();
      // Big fish behind, small fish in front.
      [...school].sort((a, b) => b.L - a.L).forEach(paintFish);

      for (const b of bubbles) {
        const c = Math.round(b.x);
        const r = Math.round(b.y);
        if (c >= 0 && r >= 0 && c < cols && r < rows) over[r * cols + c] = b.r === 2 ? "O" : "o";
      }

      // Ordered dithering -> characters.
      const n = RAMP.length - 1;
      const out: string[] = new Array(rows);
      for (let r = 0; r < rows; r++) {
        let s = "";
        const brow = (r & 3) * 4;
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          if (over[i]) {
            s += over[i];
            continue;
          }
          const q = clamp(buf[i], 0, 1) * n;
          const lo = Math.floor(q);
          const level = Math.min(n, lo + (q - lo > BAYER4[brow + (c & 3)] ? 1 : 0));
          s += RAMP[level];
        }
        out[r] = s;
      }
      pre.textContent = out.join("\n");
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - prev < 1000 / FPS) return;
      frame(now, true);
    };

    if (reduceMotion) frame(performance.now(), false);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <pre
      ref={preRef}
      aria-hidden="true"
      className="absolute inset-0 m-0 select-none overflow-hidden font-mono text-[11px] leading-[1.15] sm:text-[12px]"
      style={{
        // Surface-to-deep colour shift (theme-aware, see globals.css).
        backgroundImage: "var(--sea-gradient)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    />
  );
}
