import type { Moment } from "@/lib/journey";

function seeded(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/** A tiny breathing-line shape, unique to each moment. Decorative: it encodes nothing about progress. */
export default function MomentGlyph({ moment, className = "size-12" }: { moment: Moment; className?: string }) {
  const rand = seeded(moment.id);
  const id = `glyph-${moment.id}`;
  const paths = [0, 1, 2].map((i) => {
    const amp = 6 + rand() * 12;
    const phase = rand() * Math.PI * 2;
    const freq = 0.9 + rand() * 0.9;
    const pts: string[] = [];
    for (let x = 0; x <= 48; x += 2) {
      const env = Math.exp(-(((x - 24) / 11) ** 2));
      pts.push(`${x} ${(24 + (i === 1 ? -1 : 1) * amp * env * Math.sin((x - 24) * 0.28 * freq + phase)).toFixed(1)}`);
    }
    return `M${pts.join(" L")}`;
  });
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff9fd0" />
          <stop offset="1" stopColor="#a8b4ff" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={`url(#${id})`} strokeWidth="1.4" strokeLinecap="round" opacity={0.95 - i * 0.2} />
      ))}
    </svg>
  );
}
