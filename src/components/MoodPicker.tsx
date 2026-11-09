"use client";

import { useEffect, useRef, useState } from "react";
import SoundBadge from "@/components/SoundBadge";
import Button from "@/components/ui/Button";
import { useMood } from "@/lib/arrival";
import { DEFAULT_HZ, MOODS, getMood } from "@/lib/moods";
import { usePreferences } from "@/lib/preferences";
import { playPreview, stopPreview, unlockAudio } from "@/lib/sound";

/** Choosing a mood recolours the shape above and plays a few seconds of its tone, so the choice is felt. */
export default function MoodPicker() {
  const [moodId, setMood] = useMood();
  const [{ sound }, updatePrefs] = usePreferences();
  const [previewing, setPreviewing] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const mood = getMood(moodId);

  const sample = (hz: number) => {
    window.clearTimeout(timer.current);
    unlockAudio();
    if (playPreview(hz)) {
      setPreviewing(true);
      timer.current = window.setTimeout(() => setPreviewing(false), 4000);
    }
  };

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      stopPreview();
    },
    [],
  );

  return (
    <fieldset className="w-full">
      <legend className="sr-only">How are you arriving?</legend>
      <div className="flex flex-wrap justify-center gap-2">
        {MOODS.map((m) => (
          <label key={m.id} className="cursor-pointer">
            <input
              type="radio"
              name="mood"
              value={m.id}
              checked={moodId === m.id}
              onChange={() => {
                setMood(m.id);
                if (sound) sample(m.hz);
              }}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-11 items-center rounded-full border border-white/20 bg-white/10 px-4 text-sm transition-colors hover:bg-white/20 peer-checked:border-white peer-checked:bg-white peer-checked:text-[var(--btn-ink)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white">
              {m.label}
            </span>
          </label>
        ))}
      </div>

      <div aria-live="polite" className="mt-5 min-h-28 rounded-3xl border border-white/15 bg-white/10 p-4 text-left backdrop-blur">
        {mood ? (
          <>
            <p className="font-display text-lg font-semibold">{mood.label}</p>
            <p className="mt-1 text-sm leading-6 text-foreground/90">{mood.note}</p>
          </>
        ) : (
          <p className="text-sm leading-6 text-foreground/90">
            Tap a feeling. The shape will change colour{sound ? " and you will hear its tone" : ""}. Or skip and simply
            continue.
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {sound ? (
            <SoundBadge hz={mood?.hz ?? DEFAULT_HZ} playing={previewing} />
          ) : (
            <span className="text-sm text-foreground/80">Sound is off.</span>
          )}
          <Button
            variant="quiet"
            className="min-h-11 px-4 text-sm"
            aria-pressed={sound}
            onClick={() => {
              const next = !sound;
              unlockAudio();
              updatePrefs({ sound: next });
              if (next) sample(mood?.hz ?? DEFAULT_HZ);
              else {
                stopPreview();
                setPreviewing(false);
              }
            }}
          >
            {sound ? "Turn sound off" : "Turn sound on"}
          </Button>
          {mood && sound && !previewing && (
            <Button variant="ghost" className="min-h-11 px-3 text-sm" onClick={() => sample(mood.hz)}>
              Hear it again
            </Button>
          )}
        </div>
      </div>
    </fieldset>
  );
}
