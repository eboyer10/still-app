"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Backdrop from "@/components/Backdrop";
import BreathVisual from "@/components/BreathVisual";
import SoundBadge from "@/components/SoundBadge";
import Button, { buttonClass } from "@/components/ui/Button";
import RadioCard from "@/components/ui/RadioCard";
import { CUSTOM_ACTION_ID, MOMENT_ACTIONS } from "@/lib/actions";
import { BREATH_DURATION_MS, breathCue, breathValue, useBreathTimer, type BreathCue } from "@/lib/breath";
import { addMoment, INTENTION_LIMIT, REFLECTION_LIMIT } from "@/lib/journey";
import { usePreferences } from "@/lib/preferences";
import { startBreathSound, unlockAudio, type BreathSound } from "@/lib/sound";

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
  isTyping(target) || (target instanceof HTMLElement && ["BUTTON", "A", "LABEL"].includes(target.tagName));

const heading = "font-display text-3xl font-bold leading-tight tracking-tight outline-none sm:text-5xl";

/**
 * The guided moment, a full-screen layer over Today: breathe, keep, close. No navigation, no page change.
 * Everything after the breath is optional and only saved on this device.
 */
export default function Session({ hz, moodLabel, onExit }: { hz: number; moodLabel: string | null; onExit: () => void }) {
  const [{ sound, haptics }, updatePrefs] = usePreferences();
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
  const breathCompleted = useRef(false);
  const saved = useRef(false);
  const lastCue = useRef<BreathCue | null>(null);
  const hapticsRef = useRef(haptics);
  useEffect(() => {
    hapticsRef.current = haptics;
  }, [haptics]);

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
        if (hapticsRef.current && "vibrate" in navigator) navigator.vibrate(next === "settle" ? 0 : 40);
      }
    },
    onComplete: finishBreath,
  });

  // The tone only plays while the breath is running.
  useEffect(() => {
    if (!sound || step !== "breathe" || paused) return;
    const tone = startBreathSound(hz);
    soundRef.current = tone;
    return () => {
      tone?.stop();
      soundRef.current = null;
    };
  }, [sound, step, paused, hz]);

  // Outside the breath, the shape simply rests.
  useEffect(() => {
    if (step !== "breathe") stageRef.current?.style.setProperty("--breath", REST_BREATH);
  }, [step]);

  // The session owns the screen: hide the tab bar behind it, and move focus to each step's heading.
  useEffect(() => {
    document.body.dataset.session = "";
    return () => {
      delete document.body.dataset.session;
    };
  }, []);
  useEffect(() => {
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
        onExit();
      } else if (event.key === " " && step === "breathe" && !isInteractive(event.target)) {
        event.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onExit, step, togglePause, reflection, customAction]);

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

  const chosen = MOMENT_ACTIONS.find((a) => a.id === actionId);
  const customText = customAction.trim();
  const canChoose = actionId === CUSTOM_ACTION_ID ? customText.length > 0 : actionId !== null;
  const chosenText = actionId === CUSTOM_ACTION_ID && customText ? customText : chosen?.invitation;

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
    <div
      ref={stageRef}
      role="dialog"
      aria-modal="true"
      aria-label="A moment"
      className="fixed inset-0 z-40 overflow-y-auto bg-background"
    >
      <Backdrop />
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        {step === "breathe" && (
          <section className="flex flex-col items-center" aria-labelledby="breathe-title">
            <BreathVisual size="immersive" />
            <h1 id="breathe-title" ref={headingRef} tabIndex={-1} className="sr-only">
              Breathing moment
            </h1>
            <p className="mb-8 text-sm uppercase tracking-widest text-foreground/75">Breathe{moodLabel ? ` · ${moodLabel}` : ""}</p>
            <p className="h-12 text-3xl font-light tracking-wide sm:text-4xl" aria-hidden="true">
              {paused ? "Paused" : CUE_TEXT[cue]}
            </p>
            <p className="mt-6 max-w-xs text-sm leading-6 text-foreground/90">
              Follow the shape as it opens and closes, or simply rest.
            </p>
            {sound && (
              <div className="mt-4">
                <SoundBadge hz={hz} playing={!paused} />
              </div>
            )}
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
              <Button variant="ghost" onClick={onExit}>
                Exit
              </Button>
            </div>
          </section>
        )}

        {step === "keep" && (
          <section className="w-full" aria-labelledby="keep-title">
            <p className="text-sm uppercase tracking-widest text-foreground/75">Keep what you like</p>
            <h1 id="keep-title" ref={headingRef} tabIndex={-1} className={`mt-3 ${heading}`}>
              Before you go
            </h1>
            <p className="mt-3 text-base leading-7 text-foreground/85">
              Both parts are optional: write a line, choose one small thing, or press Skip to finish.
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
                  className="mt-3 w-full resize-none rounded-2xl border border-foreground/25 bg-white/10 px-5 py-4 text-base leading-7 placeholder:text-foreground/70"
                />
                <p className="mt-2 px-1 text-xs text-foreground/85">
                  Saved privately on this device. You can edit or delete it anytime in Journey.
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
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {MOMENT_ACTIONS.map((action) => (
                    <RadioCard
                      key={action.id}
                      name="action"
                      value={action.id}
                      checked={actionId === action.id}
                      onChange={setActionId}
                      title={action.title}
                    />
                  ))}
                  <RadioCard
                    name="action"
                    value={CUSTOM_ACTION_ID}
                    checked={actionId === CUSTOM_ACTION_ID}
                    onChange={setActionId}
                    title="My own"
                  />
                </div>
                <p className="mt-3 min-h-12 px-1 text-base leading-6 text-foreground/90" aria-live="polite">
                  {actionId === CUSTOM_ACTION_ID ? "Something meaningful to you." : chosen?.invitation ?? "Choose one, or skip."}
                </p>
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
                      className="min-h-11 w-full rounded-2xl border border-foreground/25 bg-white/10 px-5 text-base placeholder:text-foreground/70"
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
            <BreathVisual size="compact" className="mb-6" />
            <h1 id="close-title" ref={headingRef} tabIndex={-1} className={heading}>
              Thank you for pausing.
            </h1>
            {chosenText ? (
              <>
                <p className="mt-6 max-w-sm text-sm uppercase tracking-widest text-foreground/85">When you&apos;re ready</p>
                <p className="mt-3 max-w-md font-display text-2xl font-bold leading-snug sm:text-3xl">{chosenText}</p>
                <p className="mt-6 text-base text-foreground/85">The screen can wait.</p>
              </>
            ) : (
              <p className="mt-4 max-w-sm text-base leading-7 text-foreground/85">Carry this quiet with you.</p>
            )}
            <p className="mt-6 text-sm text-foreground/80">Go gently.</p>
            {saveFailed && (
              <p className="mt-4 max-w-xs text-xs leading-5 text-foreground/85" role="status">
                Your browser wouldn&apos;t let Still save this, so it will be gone when you close the page.
              </p>
            )}
            <div className="mt-10 flex flex-col items-center gap-2">
              <Button variant="quiet" onClick={onExit}>
                {chosenText ? "I'm heading off" : "Done"}
              </Button>
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
