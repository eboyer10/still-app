"use client";

import { useEffect, useRef, useState } from "react";
import BreathVisual from "@/components/BreathVisual";
import FollowUpCard from "@/components/FollowUpCard";
import MoodGlyph from "@/components/MoodGlyph";
import SoundBadge from "@/components/SoundBadge";
import Session from "@/components/today/Session";
import Button from "@/components/ui/Button";
import { useMood } from "@/lib/arrival";
import { DEFAULT_HZ, MOODS } from "@/lib/moods";
import { usePreferences } from "@/lib/preferences";
import { useShape } from "@/lib/arrival";
import { useSky, type Sky } from "@/lib/sky";
import { playPreview, stopPreview, unlockAudio } from "@/lib/sound";
import type { CSSProperties } from "react";

const GREETING: Record<Sky, string> = {
  dawn: "Good morning",
  day: "Welcome back",
  dusk: "Good evening",
  night: "A quiet night",
};

const STEPS = ["Choose a feeling", "Breathe for 30 seconds", "Keep what you like"];

/**
 * Today is the whole home: a living shape, nine feelings, and one Begin button that is always in reach.
 * Choosing a feeling changes the shape, the colour and the tone right where you are.
 */
export default function Today() {
  const [moodId, setMood] = useMood();
  const { mood } = useShape();
  const [{ sound }, updatePrefs] = usePreferences();
  const [previewing, setPreviewing] = useState(false);
  const [session, setSession] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const sky = useSky();
  const hz = mood?.hz ?? DEFAULT_HZ;

  const sample = (tone: number) => {
    window.clearTimeout(timer.current);
    unlockAudio();
    if (playPreview(tone)) {
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

  const begin = () => {
    unlockAudio();
    window.clearTimeout(timer.current);
    stopPreview();
    setPreviewing(false);
    setSession(true);
  };

  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-col items-center px-5 pb-48 pt-8 text-center" aria-hidden={session || undefined} inert={session || undefined}>
        <p className="text-sm uppercase tracking-widest text-foreground/75">{GREETING[sky]}</p>
        <h1 className="mt-1 font-display text-5xl font-semibold tracking-tight">Still</h1>

        <BreathVisual auto className="my-6" />

        <ol className="m-0 flex list-none flex-wrap justify-center gap-x-4 gap-y-1 p-0 text-xs text-foreground/80" aria-label="How a moment goes">
          {STEPS.map((text, i) => (
            <li key={text}>
              <span className="mr-1 text-foreground/60">{i + 1}</span>
              {text}
            </li>
          ))}
        </ol>

        <fieldset className="mt-6 w-full">
          <legend className="mx-auto font-display text-2xl font-semibold">How are you arriving?</legend>
          <p className="mt-1 text-sm text-foreground/80">Optional. Each feeling has its own shape, colour and tone.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
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
                <span
                  style={{ "--tile-hue": m.hue } as CSSProperties}
                  className="flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/[0.06] px-1 py-3 text-sm transition-colors hover:bg-white/12 peer-checked:border-white peer-checked:bg-white/15 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white"
                >
                  <MoodGlyph kind={m.kind} n={m.n} className="size-9" />
                  {m.label}
                </span>
              </label>
            ))}
          </div>

          <div aria-live="polite" className="mt-4 rounded-3xl border border-white/15 bg-white/[0.06] p-4 text-left">
            {mood ? (
              <>
                <p className="font-display text-lg font-semibold">
                  {mood.label} · {mood.hz} Hz
                </p>
                <p className="mt-1 text-sm leading-6 text-foreground/85">{mood.note} Only a tradition, not a treatment.</p>
              </>
            ) : (
              <p className="text-sm leading-6 text-foreground/85">
                Tap a feeling and the shape above will become its own{sound ? ", and you will hear its tone" : ""}. Or skip it
                and just begin.
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {sound ? <SoundBadge hz={hz} playing={previewing} /> : <span className="text-sm text-foreground/80">Sound is off.</span>}
              <Button
                variant="quiet"
                className="min-h-11 px-4 text-sm"
                aria-pressed={sound}
                onClick={() => {
                  const next = !sound;
                  unlockAudio();
                  updatePrefs({ sound: next });
                  if (next) sample(hz);
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

        <div className="mt-6 w-full">
          <FollowUpCard />
        </div>
      </main>

      <div className="tabbar-lift fixed inset-x-0 bottom-[4.9rem] z-20 flex justify-center px-5">
        <Button className="min-w-64 px-10 shadow-[0_10px_40px_-8px_var(--orb-glow)]" onClick={begin} disabled={session}>
          Begin a moment
        </Button>
      </div>

      {session && <Session hz={hz} moodLabel={mood?.label ?? null} onExit={() => setSession(false)} />}
    </>
  );
}
