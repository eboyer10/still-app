"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BreathVisual from "@/components/BreathVisual";
import SiteMark from "@/components/SiteMark";
import Session from "@/components/today/Session";
import Button, { buttonClass } from "@/components/ui/Button";
import { useArrivalMood } from "@/lib/arrival";
import { DEFAULT_HZ } from "@/lib/moods";
import { updatePreferences } from "@/lib/preferences";
import { unlockAudio } from "@/lib/sound";

export default function Welcome() {
  const [session, setSession] = useState(false);
  const [afterBreath, setAfterBreath] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  const mood = useArrivalMood();

  useEffect(() => {
    if (afterBreath && !session) heading.current?.focus({ preventScroll: true });
  }, [afterBreath, session]);

  function explore() {
    updatePreferences({ introSeen: true });
    router.replace("/");
  }

  return (
    <>
      <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col overflow-x-clip px-5 pb-10 pt-4 sm:px-8 sm:pt-6" inert={session || undefined}>
        <SiteMark className="self-start" />
        <div className="flex flex-1 flex-col items-center justify-center pb-6 pt-4 text-center sm:pb-12">
          <BreathVisual auto size="hero" className="mb-5" />
          <h1 ref={heading} tabIndex={-1} className="font-display text-4xl font-medium tracking-tight sm:text-6xl">
            {afterBreath ? "Make Today yours" : "Welcome to Still"}
          </h1>
          <p className="mt-4 max-w-sm text-base leading-7 text-foreground/80">
            {afterBreath
              ? "Choose what you’d like to see first on Today, or start exploring at your own pace."
              : "A quiet place to pause and care for yourself. Begin with a 30-second breath whenever you’re ready."}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {afterBreath ? (
              <Link href="/setup" onClick={() => updatePreferences({ introSeen: true })} className={buttonClass()}>Set up Still</Link>
            ) : (
              <Button onClick={() => { unlockAudio(); setSession(true); }}>Start with a breath</Button>
            )}
            <Button variant="ghost" onClick={explore}>Explore Today</Button>
          </div>
        </div>
      </main>
      {session && <Session
        hz={mood?.hz ?? DEFAULT_HZ}
        moodId={mood?.id ?? null}
        moodLabel={mood?.label ?? null}
        onExit={() => { setSession(false); requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })); }}
        onDone={() => { setSession(false); setAfterBreath(true); }}
        doneLabel="See what’s next"
      />}
    </>
  );
}
