import { useId } from "react";
import type { Mood } from "@/lib/moods";
import { getOrbOutline } from "@/lib/orbOutline";

export default function MoodGlyph({ mood, hue, className = "size-8" }: {
  mood?: Pick<Mood, "kind" | "n"> | null;
  hue: number;
  className?: string;
}) {
  const gradient = useId();
  const points = getOrbOutline(mood)
    .map(([x, y]) => `${(50 + x).toFixed(2)},${(50 + y).toFixed(2)}`)
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className} fill="none">
      <defs>
        <linearGradient id={gradient} x1="0%" y1="80%" x2="95%" y2="15%">
          <stop stopColor={`hsl(${hue - 22} 52% 69%)`} />
          <stop offset=".48" stopColor={`hsl(${hue} 55% 83%)`} />
          <stop offset="1" stopColor={`hsl(${hue + 20} 45% 73%)`} />
        </linearGradient>
      </defs>
      <g stroke={`url(#${gradient})`}>
        <polygon points={points} strokeWidth="3" />
        <polygon points={points} transform="translate(9 12) scale(.78)" fill={`hsl(${hue} 45% 71% / 0.1)`} opacity=".65" strokeWidth="1.8" />
      </g>
    </svg>
  );
}
