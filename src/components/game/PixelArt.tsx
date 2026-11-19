/**
 * Renders a pixel-art sprite from rows of characters.
 * Each character maps to a colour in `palette` ("." = transparent).
 */
export default function PixelArt({
  rows,
  palette,
  className,
  title,
}: {
  rows: readonly string[];
  palette: Record<string, string>;
  className?: string;
  title?: string;
}) {
  const w = Math.max(...rows.map((r) => r.length));
  return (
    <svg
      viewBox={`0 0 ${w} ${rows.length}`}
      shapeRendering="crispEdges"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          palette[c] ? <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={palette[c]} /> : null,
        ),
      )}
    </svg>
  );
}

// ---------- Trophy sprites (14×14) ----------
// O = outline, F = fill, H = highlight, D = shade, B = base / metal

export const SPRITES = {
  trophy: [
    "..OOOOOOOOOO..",
    ".OHHFFFFFFFDO.",
    "OOHFFFFFFFFDOO",
    "O.OHFFFFFFDO.O",
    "O.OHFFFFFFDO.O",
    ".OOHFFFFFFDOO.",
    "...OFFFFFFDO..",
    "....OFFFFDO...",
    ".....OFFDO....",
    "......OFO.....",
    "......OFO.....",
    "....OOOOOOO...",
    "...OBBBBBBBO..",
    "...OOOOOOOOO..",
  ],
  shield: [
    ".OOOOOOOOOOOO.",
    "OHFFFFFFFFFFDO",
    "OHHFFFFFFFFDDO",
    "OHFHFFFFFFDFDO",
    "OHFFHFFFFDFFDO",
    "OHFFFHFFDFFFDO",
    "OHHFFFHDFFFDDO",
    "OHFHFFFFFFDFDO",
    ".OHFHFFFFDFDO.",
    ".OHFFHFFDFFDO.",
    "..OHFFHDFFDO..",
    "...OHFFFFDO...",
    "....OHFFDO....",
    ".....OOOO.....",
  ],
  bulb: [
    "......B.......",
    "..B...B...B...",
    "...B.OOO.B....",
    "....OHHFFO....",
    "...OHFFFFDO...",
    "...OHFFFFDO...",
    "...OFFFFFDO...",
    "....OFFFDO....",
    ".....OFDO.....",
    ".....OOOO.....",
    ".....OBBO.....",
    ".....OOOO.....",
    ".....OBBO.....",
    "......OO......",
  ],
  branch: [
    "..OOO.........",
    ".OHFFO........",
    ".OFFDO....OOO.",
    "..OOO....OHFFO",
    "...OF....OFFDO",
    "...OF.....OOO.",
    "...OF.....OF..",
    "...OF....OF...",
    "...OF...OF....",
    "...OFOOOF.....",
    "...OFFFO......",
    "..OOO.........",
    ".OHFFO........",
    ".OFFDO........",
  ],
  lock: [
    ".....OOOO.....",
    "....OBBBBO....",
    "...OB....BO...",
    "...OB....BO...",
    "...OB....BO...",
    ".OOOOOOOOOOOO.",
    ".OHFFFFFFFFDO.",
    ".OHFFFOOFFFDO.",
    ".OHFFFOOFFFDO.",
    ".OHFFFFOFFFDO.",
    ".OHFFFFOFFFDO.",
    ".OHFFFFFFFFDO.",
    ".ODDDDDDDDDDO.",
    ".OOOOOOOOOOOO.",
  ],
} as const;

export type SpriteName = keyof typeof SPRITES;

/** Palette for a sprite in a given accent colour (works in both themes). */
export function tintPalette(color: string): Record<string, string> {
  return {
    O: `color-mix(in srgb, ${color} 45%, #000)`,
    F: color,
    H: `color-mix(in srgb, ${color} 45%, #fff)`,
    D: `color-mix(in srgb, ${color} 70%, #000)`,
    B: "var(--muted)",
  };
}
