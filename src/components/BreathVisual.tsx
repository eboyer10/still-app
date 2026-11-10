"use client";

import type { CSSProperties } from "react";
import { useShape } from "@/lib/arrival";

const CENTER = 100;
const LAYERS = 9;
const LINE = "hsl(var(--hue) 85% 90%)";

const rings = Array.from({ length: 6 }, (_, k) => {
  const angle = (k * 60 * Math.PI) / 180;
  return [CENTER + 30 * Math.cos(angle), CENTER + 30 * Math.sin(angle)] as const;
});

function Geometry({ sides }: { sides: number }) {
  const polygons = Array.from({ length: LAYERS }, (_, i) => {
    const radius = 14 + i * 8.5;
    const points = Array.from({ length: sides }, (_, k) => {
      const angle = ((k * 360) / sides - 90 + i * 7) * (Math.PI / 180);
      return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)] as const;
    });
    return { points, spin: (i + 1) * 3 };
  });
  return (
    <g className="bv-poly-all">
      {rings.map(([x, y], i) => (
        <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r="46" fill="none" style={{ stroke: LINE }} strokeOpacity="0.2" strokeWidth="0.5" />
      ))}
      {polygons.map(({ points, spin }, i) => (
        <g key={i} className="bv-layer" style={{ "--spin": `${spin}deg` } as CSSProperties}>
          <polygon
            points={points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ")}
            fill="none"
            style={{ stroke: LINE }}
            strokeOpacity="0.85"
            strokeWidth="0.7"
            strokeLinejoin="round"
          />
          {points.map(([x, y], k) => (
            <circle key={k} cx={x.toFixed(2)} cy={y.toFixed(2)} r="1" style={{ fill: LINE }} />
          ))}
        </g>
      ))}
      <circle cx={CENTER} cy={CENTER} r="2" fill="#fff" />
    </g>
  );
}

const PETAL_SHIFTS = [0, 50, 112, -52];

function Bloom({ petals }: { petals: number }) {
  return (
    <>
      <g className="bv-bloom-all">
        {Array.from({ length: petals }, (_, i) => (
          <g key={i} transform={`rotate(${i * (360 / petals)})`}>
            <ellipse
              className="bv-petal"
              cx={CENTER + 18}
              cy={CENTER}
              rx="72"
              ry="22"
              fill="none"
              style={{ stroke: `hsl(calc(var(--hue) + ${PETAL_SHIFTS[i % PETAL_SHIFTS.length]}) 92% 74%)` }}
              strokeWidth="1"
              strokeOpacity="0.9"
            />
          </g>
        ))}
      </g>
      <circle className="bv-disc" cx={CENTER} cy={CENTER} r="26" fill="#05071c" fillOpacity="0.92" stroke="#fff" strokeWidth="1.6" />
    </>
  );
}

type Size = "hero" | "small" | "compact" | "immersive";

/**
 * The breathing visual: nested geometry or a bloom of orbits. A chosen feeling gives it its own shape, colour
 * and number of sides or petals; until then it is random on each page load. It reads the shared `--breath`
 * value (0..1). `auto` runs its own gentle loop; the guided session drives `--breath` itself.
 */
export default function BreathVisual({
  size = "hero",
  auto = false,
  className = "",
}: {
  size?: Size;
  auto?: boolean;
  className?: string;
}) {
  const shape = useShape();
  const classes = ["bv", `bv-${size}`, auto && "bv-auto", className].filter(Boolean).join(" ");

  return (
    <div aria-hidden="true" className={classes} style={{ "--hue": shape.hue } as CSSProperties}>
      <div className="bv-glow" />
      <svg viewBox="0 0 200 200" className="bv-svg">
        {shape.kind === "geometry" ? <Geometry sides={shape.n} /> : <Bloom petals={shape.n} />}
      </svg>
    </div>
  );
}
