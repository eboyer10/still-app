"use client";

import { useMood } from "@/lib/arrival";
import { MOODS, getMood } from "@/lib/moods";

/** "How are you arriving?" Optional. The choice sets the colour and the tone of the moment. */
export default function MoodPicker() {
  const [moodId, setMood] = useMood();
  const mood = getMood(moodId);

  return (
    <fieldset className="mt-8 w-full">
      <legend className="mx-auto font-display text-xl font-semibold">How are you arriving?</legend>
      <p className="mt-1 text-sm leading-6 text-foreground/80">
        Optional. Your answer shapes the colour and the tone of your moment.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {MOODS.map((m) => (
          <label key={m.id} className="cursor-pointer">
            <input
              type="radio"
              name="mood"
              value={m.id}
              checked={moodId === m.id}
              onChange={() => setMood(m.id)}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-11 items-center rounded-full border border-white/20 bg-white/10 px-4 text-sm transition-colors hover:bg-white/20 peer-checked:border-white peer-checked:bg-white peer-checked:text-[var(--btn-ink)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white">
              {m.label}
            </span>
          </label>
        ))}
      </div>
      <div aria-live="polite" className="mt-4 min-h-24 rounded-3xl border border-white/15 bg-white/10 p-4 text-left backdrop-blur">
        {mood ? (
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-1.5 size-3 shrink-0 rounded-full"
              style={{ background: `hsl(${mood.hue} 90% 72%)`, boxShadow: `0 0 12px 3px hsl(${mood.hue} 90% 72% / 0.6)` }}
            />
            <p className="text-sm leading-6 text-foreground/90">
              <span className="font-display text-lg font-semibold text-foreground">
                {mood.label} · {mood.hz} Hz
              </span>
              <br />
              {mood.note} Only a tradition, not a treatment.
            </p>
          </div>
        ) : (
          <p className="text-sm leading-6 text-foreground/85">
            Choose one to see its colour and tone, or skip this and simply begin.
          </p>
        )}
      </div>
    </fieldset>
  );
}
