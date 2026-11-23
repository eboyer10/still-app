"use client";

import Link from "next/link";
import { useState } from "react";
import BreathVisual from "@/components/BreathVisual";
import FollowUpCard from "@/components/FollowUpCard";
import MoodGlyph from "@/components/MoodGlyph";
import ListeningSuggestion from "@/components/today/ListeningSuggestion";
import Session from "@/components/today/Session";
import Button from "@/components/ui/Button";
import { useMood } from "@/lib/arrival";
import { DEFAULT_HZ, getMood, MOODS } from "@/lib/moods";
import { usePreferences } from "@/lib/preferences";
import { useSky, type Sky } from "@/lib/sky";
import { unlockAudio } from "@/lib/sound";

const GREETING: Record<Sky, string> = {
  dawn: "Good morning",
  day: "Welcome back",
  dusk: "Good evening",
  night: "A quiet night",
};

export default function Mindfulness() {
  const [moodId, setMood] = useMood();
  const mood = getMood(moodId);
  const [{ soundscape }] = usePreferences();
  const [session, setSession] = useState(false);
  const sky = useSky();
  const hz = mood?.hz ?? DEFAULT_HZ;

  function begin() {
    if (soundscape !== "silent") unlockAudio();
    setSession(true);
  }

  return (
    <>
      <main className="mx-auto flex w-full max-w-5xl flex-col items-center px-5 pb-16 pt-4 text-center sm:px-8 sm:pt-8" aria-hidden={session || undefined} inert={session || undefined}>
        <Link href="/" className="mb-3 inline-flex sm:mb-5 min-h-11 items-center text-sm text-foreground/80 hover:underline">← Today</Link>
        <p className="text-sm uppercase tracking-widest text-foreground/75">{GREETING[sky]}</p>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Mindfulness</h1>

        <div className="mt-2 grid w-full max-w-md items-center md:mt-10 md:max-w-none md:grid-cols-2 md:gap-6 lg:gap-10">
          <BreathVisual auto className="mx-auto my-2 max-sm:[--orb-width:clamp(8rem,43vw,13rem)] md:[--orb-width:min(100%,24rem)]" />

          <div className="min-w-0">
            <fieldset className="min-w-0">
              <legend className="mx-auto font-display text-2xl font-semibold">How are you arriving?</legend>
              <p className="mt-1 text-sm text-foreground/80">Optional. Each feeling changes the orb’s shape and colour.</p>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-5">
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
                    <span className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-[1.25rem] border border-white/15 bg-white/[0.045] px-1 py-1.5 text-xs transition-colors hover:bg-white/10 peer-checked:border-[#c9d6fa]/75 peer-checked:bg-[#bdcaff]/14 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white sm:min-h-24 sm:gap-1.5 sm:px-2 sm:text-sm">
                      <MoodGlyph mood={m} hue={m.hue} className="size-8 sm:size-10" />
                      {m.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Button className="mt-5 min-w-52 px-8" onClick={begin} disabled={session}>Begin a moment</Button>
          </div>
        </div>

        <div className="mt-6 w-full max-w-md md:mt-10 md:max-w-xl">
          <FollowUpCard />
          <ListeningSuggestion id="guided-meditation" />
        </div>
      </main>

      {session && <Session hz={hz} moodId={moodId} moodLabel={mood?.label ?? null} onExit={() => setSession(false)} />}
    </>
  );
}
