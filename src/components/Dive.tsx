import AsciiBackdrop, { type Zone } from "./AsciiBackdrop";

/** Full-width wrapper: gives a section its ocean zone and a background that darkens with depth. */
export default function Dive({ zone, level, children }: { zone: Zone; level: number; children: React.ReactNode }) {
  const from = Math.max(0, level - 1) * 3.2;
  const to = level * 3.2;
  return (
    <div
      className="relative isolate overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, color-mix(in srgb, var(--depth-tint) ${from}%, var(--background)), color-mix(in srgb, var(--depth-tint) ${to}%, var(--background)))`,
      }}
    >
      <AsciiBackdrop zone={zone} />
      {children}
    </div>
  );
}
