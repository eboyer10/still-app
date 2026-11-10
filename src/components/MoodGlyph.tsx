/** A tiny drawing of a feeling's own shape: an n-sided outline, or a rosette with n petals. */
type GlyphProps = { kind: "geometry" | "bloom"; n: number; hue: number };

export default function MoodGlyph({ kind, n, hue, className = "size-8" }: GlyphProps & { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" strokeWidth="1.3" style={{ stroke: `hsl(${hue} 90% 80%)` }}>
      <GlyphShapes kind={kind} n={n} />
    </svg>
  );
}

/** The drawing alone, on a 32x32 grid, for placing inside a larger SVG. */
export function GlyphShapes({ kind, n }: Pick<GlyphProps, "kind" | "n">) {
  return (
    <>
      {kind === "geometry" ? (
        <>
          <polygon
            points={Array.from({ length: n }, (_, k) => {
              const a = ((k * 360) / n - 90) * (Math.PI / 180);
              return `${(16 + 12 * Math.cos(a)).toFixed(1)},${(16 + 12 * Math.sin(a)).toFixed(1)}`;
            }).join(" ")}
            strokeLinejoin="round"
          />
          <polygon
            points={Array.from({ length: n }, (_, k) => {
              const a = ((k * 360) / n - 90 + 12) * (Math.PI / 180);
              return `${(16 + 6.5 * Math.cos(a)).toFixed(1)},${(16 + 6.5 * Math.sin(a)).toFixed(1)}`;
            }).join(" ")}
            strokeLinejoin="round"
            opacity="0.7"
          />
        </>
      ) : (
        Array.from({ length: n }, (_, k) => (
          <ellipse key={k} cx="22" cy="16" rx="8" ry="3.2" transform={`rotate(${(k * 360) / n} 16 16)`} />
        ))
      )}
    </>
  );
}
