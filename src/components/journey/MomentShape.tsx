import MoodGlyph from "@/components/MoodGlyph";
import { NEUTRAL_HUE, getMood } from "@/lib/moods";
import type { Moment } from "@/lib/journey";

/** A moment drawn as the shape and colour of the feeling it began with. */
export default function MomentShape({ moment, className = "size-12" }: { moment: Moment; className?: string }) {
  const mood = moment.mood ? getMood(moment.mood) : undefined;
  return (
    <span
      className="grid shrink-0 place-items-center rounded-2xl border border-white/8 bg-white/[0.05]"
      style={{ boxShadow: `inset 0 0 22px hsl(${mood?.hue ?? NEUTRAL_HUE} 45% 52% / 0.2)` }}
    >
      <MoodGlyph mood={mood} hue={mood?.hue ?? NEUTRAL_HUE} className={className} />
    </span>
  );
}
