import { useId } from "react";
import type { ShapeKind } from "@/lib/moods";

function roundedOutline(sides: number) {
  const corners = Array.from({ length: sides }, (_, index) => {
    const angle = index * 2 * Math.PI / sides - Math.PI / 2;
    return [16 + 12 * Math.cos(angle), 16 + 12 * Math.sin(angle)];
  });
  const midpoint = (a: number[], b: number[]) => a.map((point, axis) => (point + b[axis]) / 2).join(" ");
  return corners.map((corner, index) => {
    const next = corners[(index + 1) % sides];
    const start = index === 0 ? `M${midpoint(corners[sides - 1], corner)}` : "";
    return `${start} Q${corner.join(" ")} ${midpoint(corner, next)}`;
  }).join(" ") + " Z";
}

export default function MoodGlyph({ kind, n, hue, className = "size-8" }: {
  kind: ShapeKind;
  n: number;
  hue: number;
  className?: string;
}) {
  const gradient = useId();

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" strokeWidth="1">
      <defs>
        <linearGradient id={gradient} x1="0%" y1="80%" x2="95%" y2="15%">
          <stop stopColor={`hsl(${hue - 16} 57% 72%)`} />
          <stop offset=".48" stopColor={`hsl(${hue} 64% 85%)`} />
          <stop offset="1" stopColor={`hsl(${hue + 18} 48% 77%)`} />
        </linearGradient>
      </defs>
      <g stroke={`url(#${gradient})`}>
        {kind === "geometry" ? (
          <>
            <path d={roundedOutline(n)} />
            <path d={roundedOutline(n)} transform="translate(5.6 5.6) scale(.65) rotate(12 16 16)" opacity=".55" />
          </>
        ) : (
          Array.from({ length: n }, (_, index) => (
            <ellipse key={index} cx="21" cy="16" rx="8.5" ry="3.5" transform={`rotate(${index * 360 / n} 16 16)`} opacity=".8" />
          ))
        )}
      </g>
    </svg>
  );
}
