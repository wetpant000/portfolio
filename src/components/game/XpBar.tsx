/** Segmented bar; fills (stepped) when an ancestor Reveal becomes visible. */
export default function XpBar({ pct, color = "var(--gold)" }: { pct: number; color?: string }) {
  return (
    <div className="xp-track" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="xp-fill" style={{ "--w": `${pct}%`, "--fill": color } as React.CSSProperties} />
    </div>
  );
}
