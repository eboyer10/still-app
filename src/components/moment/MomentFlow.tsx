"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import BreathingLines from "@/components/BreathingLines";
import Button, { buttonClass } from "@/components/ui/Button";
import SkyBackground from "@/components/SkyBackground";
import SiteMark from "@/components/SiteMark";
import RadioCard from "@/components/ui/RadioCard";
import { CUSTOM_ACTION_ID, MOMENT_ACTIONS } from "@/lib/actions";
import { usePreferences } from "@/lib/preferences";
import { startBreathSound, unlockAudio, type BreathSound } from "@/lib/sound";
import { addMoment, INTENTION_LIMIT, REFLECTION_LIMIT } from "@/lib/journey";
import {
  BREATH_DURATION_MS,
  breathCue,
  breathValue,
  useBreathTimer,
  type BreathCue,
} from "@/lib/breath";

type Step = "breathe" | "keep" | "close";

const CUE_TEXT: Record<BreathCue, string> = {
  in: "Breathe in",
  out: "Breathe out",
  settle: "Rest here",
};

const REST_BREATH = "0.3";

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

const isInteractive = (target: EventTarget | null) =>
  isTyping(target) ||
  (target instanceof HTMLElement && ["BUTTON", "A", "LABEL"].includes(target.tagName));

export default function MomentFlow() {
  const router = useRouter();
  const [{ sound }, updatePrefs] = usePreferences();
  const soundRef = useRef<BreathSound | null>(null);
  const [step, setStep] = useState<Step>("breathe");
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState("");
  const [cue, setCue] = useState<BreathCue>("in");
  const [reflection, setReflection] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [customAction, setCustomAction] = useState("");
  const [keepReflection, setKeepReflection] = useState(true);
  const [saveFailed, setSaveFailed] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const breathCompleted = useRef(false);
  const saved = useRef(false);
  const lastCue = useRef<BreathCue | null>(null);

  const finishBreath = useCallback(() => {
    breathCompleted.current = true;
    setStep("keep");
  }, []);

  useBreathTimer({
    durationMs: BREATH_DURATION_MS,
    running: step === "breathe" && !paused,
    onFrame: (ms) => {
      const value = breathValue(ms);
      stageRef.current?.style.setProperty("--breath", value.toFixed(4));
      soundRef.current?.update(value);
      const next = breathCue(ms);
      setCue(next);
      // Announce each phase once, politely, so screen reader users get the same cues.
      if (next !== lastCue.current) {
        lastCue.current = next;
        setStatus(CUE_TEXT[next]);
      }
    },
    onComplete: finishBreath,
  });

  // The optional tone only plays while the breath is running.
  useEffect(() => {
    if (!sound || step !== "breathe" || paused) return;
    const tone = startBreathSound();
    soundRef.current = tone;
    return () => {
      tone?.stop();
      soundRef.current = null;
    };
  }, [sound, step, paused]);

  // Outside the breath, the lines simply rest.
  useEffect(() => {
    if (step !== "breathe") stageRef.current?.style.setProperty("--breath", REST_BREATH);
  }, [step]);

  // Move focus to each new step's heading so keyboard and screen reader users follow along.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const togglePause = useCallback(() => {
    setPaused((p) => {
      setStatus(p ? "Resumed" : "Paused");
      return !p;
    });
  }, []);

  // Escape exits, Space pauses; neither fires while typing or on a focused control.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isTyping(event.target)) {
        // Never throw away words someone has started to write.
        if (step === "keep" && (reflection.trim() || customAction.trim())) return;
        router.push("/");
      } else if (
        event.key === " " &&
        step === "breathe" &&
        !isInteractive(event.target)
      ) {
        event.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, step, togglePause, reflection, customAction]);

  // A hidden tab shouldn't quietly use up the 30 seconds.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setPaused(true);
        setStatus("Paused");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const heading = "font-display text-3xl font-bold leading-tight tracking-tight outline-none sm:text-5xl";

  const chosen = MOMENT_ACTIONS.find((a) => a.id === actionId);
  const customText = customAction.trim();
  const canChoose = actionId === CUSTOM_ACTION_ID ? customText.length > 0 : actionId !== null;
  const chosenText =
    actionId === CUSTOM_ACTION_ID && customText ? customText : chosen?.invitation;

  // Reaching the close saves the Moment once, with only what the person actually gave.
  const finish = (keepAnything: boolean) => {
    if (!saved.current) {
      saved.current = true;
      const intention =
        keepAnything && canChoose && chosenText
          ? actionId === CUSTOM_ACTION_ID
            ? { source: "custom" as const, text: customText }
            : { source: "preset" as const, presetId: actionId ?? undefined, text: chosenText }
          : undefined;
      const ok = addMoment({
        breathCompleted: breathCompleted.current,
        reflection: keepAnything && keepReflection ? reflection : undefined,
        intention,
      });
      setSaveFailed(!ok);
    }
    setStep("close");
  };

  return (
    <div ref={stageRef} className="relative min-h-dvh overflow-hidden">
      <SkyBackground />
      <div className="moment-atmosphere" aria-hidden="true" />
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      {step !== "breathe" && (
        <div className="absolute left-4 top-3 z-20 sm:left-8 sm:top-5">
          <SiteMark />
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
        {step === "breathe" && (
          <section className="flex flex-col items-center" aria-labelledby="breathe-title">
            <h1 id="breathe-title" ref={headingRef} tabIndex={-1} className="sr-only">
              Breathing moment
            </h1>
            <BreathingLines />
            <p className="mt-12 h-8 text-xl font-light tracking-wide sm:text-2xl" aria-hidden="true">
              {paused ? "Paused" : CUE_TEXT[cue]}
            </p>
            <p className="mt-6 max-w-xs text-sm leading-6 text-foreground/75">
              Breathe however feels right. Follow the lines, or simply rest.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button variant="quiet" onClick={togglePause} aria-pressed={paused}>
                {paused ? "Resume" : "Pause"}
              </Button>
              <Button
                variant="ghost"
                aria-pressed={sound}
                onClick={() => {
                  unlockAudio();
                  updatePrefs({ sound: !sound });
                }}
              >
                {sound ? "Mute sound" : "Play sound"}
              </Button>
              <Button variant="ghost" onClick={() => setStep("keep")}>
                Skip
              </Button>
              <Link href="/" className={buttonClass("ghost")}>
                Exit
              </Link>
            </div>
          </section>
        )}

        {step === "keep" && (
          <section className="w-full" aria-labelledby="keep-title">
            <h1 id="keep-title" ref={headingRef} tabIndex={-1} className={heading}>
              Before you go
            </h1>
            <p className="mt-3 text-base leading-7 text-foreground/85">
              Both parts are optional. Skip whatever doesn&apos;t call to you.
            </p>
            <form
              className="mt-8 flex flex-col items-center gap-8 text-left"
              onSubmit={(event) => {
                event.preventDefault();
                finish(true);
              }}
            >
              <div className="w-full">
                <label htmlFor="reflection" className="block text-lg font-medium leading-7">
                  What would make the rest of today feel more meaningful?
                </label>
                <textarea
                  id="reflection"
                  value={reflection}
                  onChange={(event) => setReflection(event.target.value)}
                  maxLength={REFLECTION_LIMIT}
                  rows={3}
                  placeholder="A word, a sentence, anything at all."
                  className="mt-3 w-full resize-none rounded-2xl border border-foreground/20 bg-transparent px-5 py-4 text-base leading-7 placeholder:text-foreground/75"
                />
                <p className="mt-2 px-1 text-xs text-foreground/85">
                  Saved privately on this device. You can edit or delete it anytime in My journey.
                </p>
                <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 px-1 text-sm text-foreground/85">
                  <input
                    type="checkbox"
                    checked={!keepReflection}
                    onChange={(event) => setKeepReflection(!event.target.checked)}
                    className="size-5 accent-foreground"
                  />
                  Don&apos;t save this reflection
                </label>
              </div>

              <fieldset className="w-full">
                <legend className="text-lg font-medium leading-7">
                  Is there one small thing you&apos;d like to do, away from the screen?
                </legend>
                <div className="mt-3 grid gap-3">
                  {MOMENT_ACTIONS.map((action) => (
                    <RadioCard
                      key={action.id}
                      name="action"
                      value={action.id}
                      checked={actionId === action.id}
                      onChange={setActionId}
                      title={action.title}
                      description={action.invitation}
                    />
                  ))}
                  <RadioCard
                    name="action"
                    value={CUSTOM_ACTION_ID}
                    checked={actionId === CUSTOM_ACTION_ID}
                    onChange={setActionId}
                    title="Choose my own action"
                    description="Something meaningful to you."
                  />
                </div>
                {actionId === CUSTOM_ACTION_ID && (
                  <div className="mt-3">
                    <label htmlFor="custom-action" className="sr-only">
                      Your own action
                    </label>
                    <input
                      id="custom-action"
                      type="text"
                      value={customAction}
                      onChange={(event) => setCustomAction(event.target.value)}
                      maxLength={INTENTION_LIMIT}
                      placeholder="What feels right for you?"
                      className="min-h-11 w-full rounded-2xl border border-foreground/20 bg-transparent px-5 text-base placeholder:text-foreground/75"
                    />
                  </div>
                )}
              </fieldset>

              <div className="flex flex-col items-center gap-3 self-center sm:flex-row">
                <Button type="submit">Continue</Button>
                <Button variant="ghost" onClick={() => finish(false)}>
                  Skip
                </Button>
              </div>
            </form>
          </section>
        )}

        {step === "close" && (
          <section className="flex flex-col items-center" aria-labelledby="close-title">
            <BreathingLines className="mb-10" />
            <h1 id="close-title" ref={headingRef} tabIndex={-1} className={heading}>
              Thank you for pausing.
            </h1>
            {chosenText ? (
              <>
                <p className="mt-6 max-w-sm text-sm uppercase tracking-widest text-foreground/75">
                  When you&apos;re ready
                </p>
                <p className="mt-3 max-w-md font-display text-2xl font-bold leading-snug sm:text-3xl">
                  {chosenText}
                </p>
                <p className="mt-6 text-base text-foreground/85">The screen can wait.</p>
              </>
            ) : (
              <p className="mt-4 max-w-sm text-base leading-7 text-foreground/85">
                Carry this quiet with you.
              </p>
            )}
            <p className="mt-6 text-sm text-foreground/70">Go gently.</p>
            {saveFailed && (
              <p className="mt-4 max-w-xs text-xs leading-5 text-foreground/75" role="status">
                Your browser wouldn&apos;t let Still save this, so it will be gone when you close the page.
              </p>
            )}
            <div className="mt-10 flex flex-col items-center gap-2">
              <Link href="/" className={buttonClass("quiet")}>
                {chosenText ? "I'm heading off" : "Done"}
              </Link>
              <Link href="/journey" className={buttonClass("ghost", "text-sm")}>
                View my journey
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
