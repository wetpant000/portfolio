import {
  siCplusplus, siPython, siOpenjdk, siHtml5, siTailwindcss, siJavascript, siTypescript, siReact, siNextdotjs,
  siFastapi, siNodedotjs, siExpress, siMysql, siSqlite, siMongodb, siPostgresql, siDocker, siKubernetes, siRedis,
  siGithub, siPostman, siFigma,
  type SimpleIcon,
} from "simple-icons";
import { Brain, Bot, Boxes, Database, Network, Binary, Layers, ShieldCheck, type LucideIcon } from "lucide-react";

// Real brand logos (Simple Icons) for languages/tools; generic icons (Lucide) for concepts.
const BRAND: Record<string, SimpleIcon> = {
  "C++": siCplusplus, Python: siPython, Java: siOpenjdk,
  HTML: siHtml5, "Tailwind CSS": siTailwindcss, JavaScript: siJavascript, TypeScript: siTypescript, React: siReact, "Next.js": siNextdotjs,
  FastAPI: siFastapi, "Node.js": siNodedotjs, "Express.js": siExpress, MySQL: siMysql, SQLite: siSqlite, MongoDB: siMongodb, PostgreSQL: siPostgresql,
  Docker: siDocker, Kubernetes: siKubernetes, Redis: siRedis,
  "Git / GitHub": siGithub, Postman: siPostman, Figma: siFigma,
};
const CONCEPT: Record<string, LucideIcon> = {
  "Machine Learning": Brain, "AI Agents": Bot,
  OOP: Boxes, DBMS: Database, "Computer Networks": Network, DSA: Binary, "Deep Learning": Layers, "Cyber Security": ShieldCheck,
};

/** Near-black brand colours (Next.js, Express, GitHub…) would vanish in dark mode — use the text colour instead. */
function brandColor(hex: string) {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum < 0.22 ? "var(--foreground)" : `#${hex}`;
}

// Each category gets a colour, shown as a corner pip and in the legend.
const COLORS = ["var(--gold)", "var(--accent)", "var(--sky)", "var(--rose)", "#a78bfa", "var(--muted)"];

/** One big bag: every skill in a single grid, colour-coded by category. */
export default function SkillInventory({ groups }: { groups: { group: string; items: string[] }[] }) {
  const items = groups.flatMap((g, gi) => g.items.map((name) => ({ name, group: g.group, color: COLORS[gi % COLORS.length] })));
  const slots = items.length;

  return (
    <div className="pixel-box mx-auto max-w-4xl p-3 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-pixel text-[10px] text-gold">BAG</p>
        <p className="font-pixel text-[8px] text-muted">
          {items.length}/{slots} SLOTS
        </p>
      </div>

      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10">
        {Array.from({ length: slots }, (_, i) => {
          const it = items[i];
          if (!it)
            return <li key={`empty-${i}`} aria-hidden className="aspect-square border-2 border-dashed border-line/60 bg-background/30" />;
          const brand = BRAND[it.name];
          const Concept = CONCEPT[it.name];
          return (
            <li
              key={it.name}
              title={`${it.name} · ${it.group}`}
              className="group relative flex aspect-square flex-col items-center justify-center gap-1.5 border-2 border-line bg-background/60 p-1 text-center transition-transform hover:-translate-y-0.5"
            >
              <span aria-hidden className="absolute top-1 left-1 h-1.5 w-1.5" style={{ background: it.color }} />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 border-2 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ borderColor: it.color }}
              />
              {brand ? (
                <svg
                  role="img"
                  aria-label={`${brand.title} logo`}
                  viewBox="0 0 24 24"
                  className="h-6 w-6 transition-transform group-hover:scale-110 sm:h-7 sm:w-7"
                  fill={brandColor(brand.hex)}
                >
                  <path d={brand.path} />
                </svg>
              ) : Concept ? (
                <Concept aria-hidden className="h-6 w-6 transition-transform group-hover:scale-110 sm:h-7 sm:w-7" style={{ color: it.color }} strokeWidth={1.75} />
              ) : (
                <span className="font-pixel text-sm" style={{ color: it.color }}>
                  {it.name.slice(0, 2)}
                </span>
              )}
              <span className="line-clamp-2 text-[9px] leading-tight text-foreground/85 sm:text-[10px]">{it.name}</span>
            </li>
          );
        })}
      </ul>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t-2 border-line pt-4">
        {groups.map((g, gi) => (
          <li key={g.group} className="flex items-center gap-2 font-pixel text-[8px] uppercase text-muted">
            <span aria-hidden className="h-2.5 w-2.5" style={{ background: COLORS[gi % COLORS.length] }} />
            {g.group} · {g.items.length}
          </li>
        ))}
      </ul>
    </div>
  );
}
