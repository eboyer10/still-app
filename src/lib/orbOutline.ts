import type { Mood } from "@/lib/moods";

type Outline = Pick<Mood, "kind" | "n">;
type Point = readonly [number, number];

const POINTS = 96;
const TURN = 2 * Math.PI;
const profiles = new Map<string, readonly Point[]>();

/** All outlines have the same point count and direction so the edges can morph. */
export function getOrbOutline(shape?: Outline | null) {
  const key = shape ? `${shape.kind}-${shape.n}` : "rest";
  const existing = profiles.get(key);
  if (existing) return existing;

  const points = Array.from({ length: POINTS }, (_, index): Point => {
    const angle = index * TURN / POINTS;
    const drift = 0.023 * Math.cos(2 * angle + 0.9) + 0.023 * Math.sin(3 * angle + 0.5);
    let radius = 39 * (1 + drift);

    if (shape?.kind === "geometry") {
      const cornerDepth = 1.1 * (1 - Math.cos(Math.PI / shape.n));
      radius *= 1 - cornerDepth * Math.abs(Math.sin(angle * shape.n / 2)) ** 1.5;
    } else if (shape?.kind === "bloom") {
      radius *= 1 + (shape.n < 5 ? 0.105 : 0.075) * Math.cos(angle * shape.n - 0.35);
    } else {
      radius *= 1 + 0.045 * Math.sin(3 * angle - 0.4);
    }

    return [radius * Math.sin(angle), -radius * Math.cos(angle)];
  });

  profiles.set(key, points);
  return points;
}

function polygonPoints(points: readonly Point[], scale = 1) {
  return points.map(([x, y]) => `${(50 + x * scale).toFixed(2)}% ${(50 + y * scale).toFixed(2)}%`);
}

export function orbClipPaths(points: readonly Point[]) {
  const outer = polygonPoints(points, 1.1);
  const [start, ...rest] = polygonPoints(points, 1.085);
  return {
    body: `polygon(${polygonPoints(points).join(",")})`,
    // Connect the two closed loops without leaving a seam in the translucent rim.
    rim: `polygon(evenodd,${[...outer, outer[0], start, ...rest.reverse(), start].join(",")})`,
  };
}
