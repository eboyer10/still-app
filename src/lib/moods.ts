export type ShapeKind = "geometry" | "bloom";

export type Mood = {
  id: string;
  label: string;
  /** Tone played while breathing, in hertz. */
  hz: number;
  /** Colour of the breathing visual (HSL hue). */
  hue: number;
  /** Which breathing visual this feeling gets, and how many sides or petals it has. */
  kind: ShapeKind;
  n: number;
  /** What the tone is traditionally associated with. Not a medical claim. */
  note: string;
};

/** How someone is arriving. Each choice sets the shape, colour and tone of their moment. */
export const MOODS: Mood[] = [
  { id: "weighed-down", label: "Weighed down", hz: 396, hue: 340, kind: "geometry", n: 6, note: "Traditionally linked with releasing guilt and fear." },
  { id: "stuck", label: "Stuck", hz: 417, hue: 25, kind: "bloom", n: 8, note: "Traditionally linked with undoing old patterns and making room for change." },
  { id: "tense", label: "Tense", hz: 432, hue: 150, kind: "geometry", n: 8, note: "A natural, Earth-aligned tuning often used for relaxing." },
  { id: "open", label: "Open-hearted", hz: 528, hue: 318, kind: "bloom", n: 12, note: "Often called the love tone, linked with transformation." },
  { id: "disconnected", label: "Disconnected", hz: 639, hue: 192, kind: "geometry", n: 7, note: "Traditionally linked with connecting to other people." },
  { id: "drained", label: "Drained", hz: 741, hue: 95, kind: "bloom", n: 6, note: "Traditionally linked with feeling cleared and refreshed." },
  { id: "scattered", label: "Scattered", hz: 852, hue: 270, kind: "geometry", n: 9, note: "Traditionally linked with returning to order." },
  { id: "overwhelmed", label: "Overwhelmed", hz: 963, hue: 228, kind: "bloom", n: 10, note: "Traditionally linked with returning to oneness and spaciousness." },
  { id: "low", label: "Low", hz: 111, hue: 45, kind: "geometry", n: 5, note: "Often described as a soft, renewing tone." },
];

export const NEUTRAL_HUE = 250;
export const DEFAULT_HZ = 432;

export function getMood(id: string | null | undefined) {
  return MOODS.find((m) => m.id === id) ?? null;
}
