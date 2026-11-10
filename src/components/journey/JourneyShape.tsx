import { GlyphShapes } from "@/components/MoodGlyph";
import { NEUTRAL_HUE, getMood } from "@/lib/moods";
import type { Moment } from "@/lib/journey";

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/**
 * Every moment becomes one small shape in the colour of the feeling it began with.
 * They gather in a sunflower spiral from the middle outward, oldest first, always evenly
 * spaced, so the picture grows fuller but never shows gaps, scores or targets.
 */
export default function JourneyShape({ moments }: { moments: Moment[] }) {
  const ordered = [...moments].reverse();
  const count = ordered.length;
  const radius = 84;
  const size = Math.min(34, Math.max(14, (radius * 1.5) / Math.sqrt(count)));

  return (
    <svg
      viewBox="-100 -100 200 200"
      role="img"
      aria-label={`A shape made of your ${count} ${count === 1 ? "moment" : "moments"}, each in the form and colour of the feeling you began with.`}
      className="mx-auto block w-full max-w-sm"
    >
      <defs>
        <radialGradient id="journey-shape-glow">
          <stop offset="0%" stopColor="white" stopOpacity="0.12" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="98" fill="url(#journey-shape-glow)" />
      {ordered.map((m, i) => {
        const mood = m.mood ? getMood(m.mood) : undefined;
        const hue = mood?.hue ?? NEUTRAL_HUE;
        const r = count === 1 ? 0 : radius * Math.sqrt(i / (count - 1));
        const a = i * GOLDEN;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);
        return (
          <g
            key={m.id}
            transform={`translate(${(x - size / 2).toFixed(2)} ${(y - size / 2).toFixed(2)}) scale(${(size / 32).toFixed(3)})`}
            fill={`hsl(${hue} 90% 70% / 0.12)`}
            stroke={`hsl(${hue} 90% 78%)`}
            strokeWidth={1.2}
            opacity={0.9}
          >
            <GlyphShapes kind={mood?.kind ?? "bloom"} n={mood?.n ?? 6} />
          </g>
        );
      })}
    </svg>
  );
}
