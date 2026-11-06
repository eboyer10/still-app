import type { JourneyCounts } from "@/lib/journey";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <li className="rounded-2xl bg-white/50 px-4 py-3">
      <span className="block font-display text-3xl font-semibold leading-none">{value}</span>
      <span className="mt-1 block text-sm leading-5 text-foreground/80">{label}</span>
    </li>
  );
}

/** Plain counts that describe, never score: no totals to beat, no percentages, no targets. */
export default function JourneySummary({ counts }: { counts: JourneyCounts }) {
  const { momentsTaken, intentionsChosen, intentionsRevisited, intentionsActedOn } = counts;
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0">
      <Stat value={momentsTaken} label={momentsTaken === 1 ? "pause taken" : "pauses taken"} />
      <Stat value={intentionsChosen} label={intentionsChosen === 1 ? "intention chosen" : "intentions chosen"} />
      <Stat value={intentionsRevisited} label="looked back on" />
      <Stat value={intentionsActedOn} label="acted upon" />
    </ul>
  );
}
