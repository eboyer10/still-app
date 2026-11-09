"use client";

import type { CSSProperties } from "react";
import { useMood, useVisual } from "@/lib/arrival";
import { NEUTRAL_HUE, getMood } from "@/lib/moods";

const CENTER = 100;
const LAYERS = 9;

const polygons = Array.from({ length: LAYERS }, (_, i) => {
  const radius = 14 + i * 8.5;
  const points = Array.from({ length: 8 }, (_, k) => {
    const angle = ((k * 45 + 22.5 + i * 7) * Math.PI) / 180;
    return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)] as const;
  });
  return { points, spin: (i + 1) * 3 };
});

const rings = Array.from({ length: 6 }, (_, k) => {
  const angle = (k * 60 * Math.PI) / 180;
  return [CENTER + 30 * Math.cos(angle), CENTER + 30 * Math.sin(angle)] as const;
});

const PETALS = 12;
const PETAL_HUES = [0, 50, 112, -52];

function Geometry({ hue }: { hue: number }) {
  const line = `hsl(${hue} 85% 90%)`;
  return (
    <g className="bv-poly-all">
      {rings.map(([x, y], i) => (
        <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r="46" fill="none" stroke={line} strokeOpacity="0.2" strokeWidth="0.5" />
      ))}
      {polygons.map(({ points, spin }, i) => (
        <g key={i} className="bv-layer" style={{ "--spin": `${spin}deg` } as CSSProperties}>
          <polygon
            points={points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ")}
            fill="none"
            stroke={line}
            strokeOpacity="0.85"
            strokeWidth="0.7"
            strokeLinejoin="round"
          />
          {points.map(([x, y], k) => (
            <circle key={k} cx={x.toFixed(2)} cy={y.toFixed(2)} r="1" fill={line} />
          ))}
        </g>
      ))}
      <circle cx={CENTER} cy={CENTER} r="2" fill="#fff" />
    </g>
  );
}

function Bloom({ hue }: { hue: number }) {
  return (
    <>
      <g className="bv-bloom-all">
        {Array.from({ length: PETALS }, (_, i) => (
          <g key={i} transform={`rotate(${i * (360 / PETALS)})`}>
            <ellipse
              className="bv-petal"
              cx={CENTER + 18}
              cy={CENTER}
              rx="72"
              ry="22"
              fill="none"
              stroke={`hsl(${hue + PETAL_HUES[i % PETAL_HUES.length]} 92% 74%)`}
              strokeWidth="1"
              strokeOpacity="0.9"
            />
          </g>
        ))}
      </g>
      <circle className="bv-disc" cx={CENTER} cy={CENTER} r="26" fill="#0b0f3a" fillOpacity="0.9" stroke="#fff" strokeWidth="1.6" />
    </>
  );
}

/**
 * The breathing visual: nested geometry or a bloom of orbits, picked at random on each page load and
 * tinted by how you said you were arriving. It reads the shared `--breath` value (0..1).
 * `auto` runs its own gentle loop (home); /moment drives `--breath` from the guided breath.
 */
export default function BreathVisual({
  auto = false,
  compact = false,
  className = "",
}: {
  auto?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const visual = useVisual();
  const [moodId] = useMood();
  const hue = getMood(moodId)?.hue ?? NEUTRAL_HUE;
  const classes = ["bv", compact && "bv-compact", auto && "bv-auto", className].filter(Boolean).join(" ");

  return (
    <div aria-hidden="true" className={classes} style={{ "--hue": hue } as CSSProperties}>
      <div className="bv-glow" />
      <svg viewBox="0 0 200 200" className="bv-svg">
        {visual === "geometry" ? <Geometry hue={hue} /> : <Bloom hue={hue} />}
      </svg>
    </div>
  );
}
