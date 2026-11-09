export type Situation = { id: string; label: string; line: string };

/** Specific reasons to pause. Each only changes the one line shown while breathing. */
export const SITUATIONS: Situation[] = [
  { id: "meeting", label: "Before a meeting", line: "Let the next thing wait. Arrive here first." },
  { id: "scrolling", label: "After scrolling", line: "Let your eyes soften. There is nothing to catch up on." },
  { id: "overwhelmed", label: "Feeling a lot", line: "You don't have to fix anything. Just breathe." },
  { id: "sleep", label: "Winding down", line: "Let the day loosen its hold, one breath at a time." },
];

export const DEFAULT_LINE = "Breathe however feels right. Follow the shape as it opens and closes, or simply rest.";

export function situationLine(id: string | null) {
  return SITUATIONS.find((s) => s.id === id)?.line ?? DEFAULT_LINE;
}
