"use client";

import { useSky } from "@/lib/sky";

type Layer = {
  /** Where the ridge sits inside its box, in % from the top. */
  base: number;
  waves: [amplitude: number, frequency: number, phase: number][];
  fill: [top: string, bottom: string];
  /** How far the layer rises on a full inhale, in vh. */
  lift: number;
  /** Seconds for one slow sideways sway. */
  sway: number;
  /** Soft focus in px: far ridges are mistier. */
  blur: number;
  crest?: boolean;
};

const LAYERS: Layer[] = [
  // Distant misty mountains.
  {
    base: 14,
    waves: [[7, 0.09, 0.4], [3, 0.24, 2.2], [1.5, 0.5, 1]],
    fill: ["rgb(235 205 255 / 0.5)", "rgb(150 105 225 / 0)"],
    lift: -1.2,
    sway: 90,
    blur: 5,
  },
  // Silky ribbons with glowing crests.
  {
    base: 34,
    waves: [[8, 0.05, 2.6], [3.5, 0.15, 0.9]],
    fill: ["rgb(175 125 245 / 0.62)", "rgb(60 36 150 / 0.35)"],
    lift: -2.4,
    sway: 70,
    blur: 2,
    crest: true,
  },
  {
    base: 54,
    waves: [[8, 0.045, 4.4], [3, 0.17, 1.4]],
    fill: ["rgb(95 58 205 / 0.8)", "rgb(12 9 56 / 0.96)"],
    lift: -3.6,
    sway: 55,
    blur: 1,
    crest: true,
  },
  {
    base: 80,
    waves: [[5, 0.05, 1.1], [2, 0.16, 3.3]],
    fill: ["rgb(8 7 32 / 0.96)", "rgb(5 4 24 / 1)"],
    lift: -5,
    sway: 45,
    blur: 0,
  },
];

function height(layer: Layer, x: number) {
  return layer.base + layer.waves.reduce((sum, [a, f, p]) => sum + a * Math.sin(x * f * 2 + p), 0);
}

function points(layer: Layer) {
  const pts: string[] = [];
  for (let x = 0; x <= 100; x += 1) pts.push(`${x} ${height(layer, x).toFixed(2)}`);
  return pts;
}

/**
 * Layered violet ridges behind the page. Everything reads the `--breath` value (0..1):
 * on /moment it is inherited from the guided breath, elsewhere `auto` runs a calm
 * 4s-in / 4s-out loop of its own. Decorative only.
 */
export default function WaveBackground({ auto = false }: { auto?: boolean }) {
  const sky = useSky();
  return (
    <div aria-hidden="true" data-sky={sky} className={`wave-bg ${auto ? "wave-bg-auto" : ""}`.trim()}>
      <div className="wave-haze" />
      {LAYERS.map((layer, index) => {
        const pts = points(layer);
        const line = `M${pts.join(" L")}`;
        const gradient = `wave-fill-${index}`;
        return (
          <div
            key={index}
            className="wave-layer"
            style={
              {
                "--lift": `${layer.lift}vh`,
                "--sway": `${layer.sway}s`,
                filter: layer.blur ? `blur(${layer.blur}px)` : undefined,
              } as React.CSSProperties
            }
          >
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={layer.fill[0]} />
                  <stop offset="1" stopColor={layer.fill[1]} />
                </linearGradient>
              </defs>
              <path d={`${line} L100 100 L0 100 Z`} fill={`url(#${gradient})`} />
              {layer.crest && (
                <path
                  d={line}
                  fill="none"
                  stroke="rgb(240 215 255 / 0.9)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  className="wave-crest"
                />
              )}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
