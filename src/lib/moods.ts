export type ShapeKind = "geometry" | "bloom";

export type Mood = {
  id: string;
  label: string;
  /** Root note of the optional breathing music, in hertz. */
  hz: number;
  /** Colour of the breathing visual (HSL hue). */
  hue: number;
  /** Which breathing visual this feeling gets, and how many sides or petals it has. */
  kind: ShapeKind;
  n: number;
};

/** How someone is arriving. Each choice sets a shape, colour, and musical root note. */
export const MOODS: Mood[] = [
  { id: "weighed-down", label: "Weighed down", hz: 396, hue: 279, kind: "geometry", n: 6 },
  { id: "stuck", label: "Stuck", hz: 417, hue: 254, kind: "bloom", n: 4 },
  { id: "tense", label: "Tense", hz: 432, hue: 210, kind: "geometry", n: 8 },
  { id: "open", label: "Open-hearted", hz: 528, hue: 287, kind: "bloom", n: 6 },
  { id: "disconnected", label: "Disconnected", hz: 639, hue: 218, kind: "geometry", n: 7 },
  { id: "drained", label: "Drained", hz: 741, hue: 230, kind: "bloom", n: 3 },
  { id: "scattered", label: "Scattered", hz: 852, hue: 264, kind: "geometry", n: 9 },
  { id: "overwhelmed", label: "Overwhelmed", hz: 963, hue: 242, kind: "bloom", n: 5 },
  { id: "low", label: "Low", hz: 111, hue: 225, kind: "geometry", n: 5 },
];

export const NEUTRAL_HUE = 250;
export const DEFAULT_HZ = 432;

export function getMood(id: string | null | undefined) {
  return MOODS.find((m) => m.id === id) ?? null;
}
