import { Guitar, BookOpen } from "lucide-react";

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Flute (bansuri): a slightly tilted tube with a blow hole and finger holes. */
function Flute(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <g transform="rotate(-20 12 12)">
        <rect x="1" y="9.75" width="22" height="4.5" rx="2.25" />
        <path d="M3.5 9.75v4.5" />
        <ellipse cx="6.5" cy="12" rx="1.1" ry="0.8" fill="currentColor" stroke="none" />
        {[11, 13.75, 16.5, 19.25].map((cx) => (
          <circle key={cx} cx={cx} cy="12" r="0.85" fill="currentColor" stroke="none" />
        ))}
      </g>
    </svg>
  );
}

/** Skateboard: kicked-up deck, trucks and wheels. */
function Skateboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M2 9.5c.6 1.5 1.7 2.5 3.5 2.5h13c1.8 0 2.9-1 3.5-2.5" />
      <path d="M7 12v2.5M17 12v2.5M5 14.5h4M15 14.5h4" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  );
}

const ICONS = { guitar: Guitar, flute: Flute, skateboard: Skateboard, book: BookOpen } as const;
export type PerkIconName = keyof typeof ICONS;

export default function PerkIcon({ name, className }: { name: PerkIconName; className?: string }) {
  const Icon = ICONS[name];
  return <Icon aria-hidden className={className} />;
}
