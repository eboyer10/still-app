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
  {
    base: 30,
    waves: [[8, 0.07, 0.4], [3, 0.19, 2.2]],
    fill: ["rgb(232 200 255 / 0.42)", "rgb(110 70 200 / 0)"],
    lift: -1.4,
    sway: 90,
    blur: 6,
    crest: true,
  },
  {
    base: 48,
    waves: [[9, 0.055, 2.6], [4, 0.17, 0.9]],
    fill: ["rgb(170 120 245 / 0.5)", "rgb(40 24 110 / 0.3)"],
    lift: -2.4,
    sway: 70,
    blur: 3,
    crest: true,
  },
  {
    base: 66,
    waves: [[8, 0.06, 4.4], [3, 0.2, 1.4]],
    fill: ["rgb(80 50 180 / 0.5)", "rgb(14 9 52 / 0.85)"],
    lift: -3.6,
    sway: 55,
    blur: 1,
    crest: true,
  },
  {
    base: 85,
    waves: [[5, 0.05, 1.1], [2, 0.16, 3.3]],
    fill: ["rgb(10 8 38 / 0.95)", "rgb(8 6 30 / 1)"],
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
                  stroke="rgb(236 205 255 / 0.45)"
                  strokeWidth="1"
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
