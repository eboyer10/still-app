"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BreathVisual from "@/components/BreathVisual";
import SiteMark from "@/components/SiteMark";
import FirstEntry from "@/components/today/FirstEntry";
import Session from "@/components/today/Session";
import Button from "@/components/ui/Button";
import { useArrivalMood } from "@/lib/arrival";
import { DEFAULT_HZ } from "@/lib/moods";
import { updatePreferences } from "@/lib/preferences";

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
      <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 pb-10 pt-4 sm:px-8 sm:pt-6" inert={session || undefined}>
        <SiteMark className="self-start" />
        <div className="flex flex-1 flex-col items-center justify-center pb-6 pt-4 text-center sm:pb-12">
          <BreathVisual auto size={afterBreath ? "compact" : "hero"} className="mb-5" />
          <h1 ref={heading} tabIndex={-1} className="font-display text-4xl font-medium tracking-tight sm:text-6xl">
            {afterBreath ? "What would you like to keep track of?" : "Welcome to Still"}
          </h1>
          <p className="mt-4 max-w-sm text-base leading-7 text-foreground/80">
            {afterBreath
              ? "Save a first entry and it’ll be there when you open Today."
              : "A quiet place to pause and care for yourself. Begin with a 30-second breath whenever you’re ready."}
          </p>
          {afterBreath && <FirstEntry onFinish={explore} />}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {!afterBreath && <Button onClick={() => setSession(true)}>Start with a breath</Button>}
            <Button variant="ghost" onClick={explore}>{afterBreath ? "Skip to Today" : "Explore Today"}</Button>
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
        quietStart
      />}
    </>
  );
}
