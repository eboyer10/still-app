"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import BreathingOrb from "@/components/BreathingOrb";
import Button, { buttonClass } from "@/components/ui/Button";
import RadioCard from "@/components/ui/RadioCard";
import { CUSTOM_ACTION_ID, MOMENT_ACTIONS } from "@/lib/actions";
import {
  BREATH_DURATION_MS,
  breathCue,
  breathValue,
  useBreathTimer,
  type BreathCue,
} from "@/lib/breath";

type Step = "arrive" | "breathe" | "reflect" | "act" | "close";

const CUE_TEXT: Record<BreathCue, string> = {
  in: "Breathe in",
  out: "Breathe out",
  settle: "Rest here",
};

const REFLECTION_LIMIT = 280;
const REST_BREATH = "0.3";

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

const isInteractive = (target: EventTarget | null) =>
  isTyping(target) ||
  (target instanceof HTMLElement && ["BUTTON", "A", "LABEL"].includes(target.tagName));

export default function MomentFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("arrive");
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState("");
  const [cue, setCue] = useState<BreathCue>("in");
  const [reflection, setReflection] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [customAction, setCustomAction] = useState("");
  // Kept in component state only: nothing here is stored or sent anywhere.

  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const finishBreath = useCallback(() => setStep("reflect"), []);

  useBreathTimer({
    durationMs: BREATH_DURATION_MS,
    running: step === "breathe" && !paused,
    onFrame: (ms) => {
      stageRef.current?.style.setProperty("--breath", breathValue(ms).toFixed(4));
      progressRef.current?.style.setProperty("transform", `scaleX(${ms / BREATH_DURATION_MS})`);
      setCue(breathCue(ms));
    },
    onComplete: finishBreath,
  });

  // Outside the breath, the orb simply rests.
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
  }, [router, step, togglePause]);

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

  const heading = "text-2xl font-light leading-snug tracking-tight outline-none sm:text-3xl";

  const chosen = MOMENT_ACTIONS.find((a) => a.id === actionId);
  const customText = customAction.trim();
  const canChoose = actionId === CUSTOM_ACTION_ID ? customText.length > 0 : actionId !== null;
  const chosenText =
    actionId === CUSTOM_ACTION_ID && customText ? customText : chosen?.invitation;

  return (
    <div ref={stageRef} className="relative min-h-dvh overflow-hidden">
      <div className="moment-atmosphere" aria-hidden="true" />
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
        {step === "arrive" && (
          <section className="flex flex-col items-center" aria-labelledby="arrive-title">
            <BreathingOrb className="mb-10" />
            <h1 id="arrive-title" ref={headingRef} tabIndex={-1} className={heading}>
              Would you like to take a moment?
            </h1>
            <p className="mt-4 max-w-sm text-base leading-7 text-foreground/70">
              Thirty seconds to pause. You can stop whenever you like.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <Button onClick={() => setStep("breathe")}>Begin</Button>
              <Link href="/" className={buttonClass("ghost")}>
                Not now
              </Link>
            </div>
          </section>
        )}

        {step === "breathe" && (
          <section className="flex flex-col items-center" aria-labelledby="breathe-title">
            <h1 id="breathe-title" ref={headingRef} tabIndex={-1} className="sr-only">
              Breathing moment
            </h1>
            <BreathingOrb />
            <p className="mt-12 h-8 text-xl font-light tracking-wide sm:text-2xl" aria-hidden="true">
              {paused ? "Paused" : CUE_TEXT[cue]}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-foreground/60">
              Breathe however feels right. Follow the orb, or simply rest.
            </p>
            <div
              className="mt-8 h-px w-40 bg-foreground/15"
              role="progressbar"
              aria-label="Moment progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-hidden="true"
            >
              <div
                ref={progressRef}
                className="h-px origin-left bg-foreground/60"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button variant="quiet" onClick={togglePause} aria-pressed={paused}>
                {paused ? "Resume" : "Pause"}
              </Button>
              <Button variant="ghost" onClick={() => setStep("reflect")}>
                Skip
              </Button>
              <Link href="/" className={buttonClass("ghost")}>
                Exit
              </Link>
            </div>
          </section>
        )}

        {step === "reflect" && (
          <section className="w-full" aria-labelledby="reflect-title">
            <h1 id="reflect-title" ref={headingRef} tabIndex={-1} className={heading}>
              What would make the rest of today feel more meaningful?
            </h1>
            <form
              className="mt-8 flex flex-col items-center gap-6"
              onSubmit={(event) => {
                event.preventDefault();
                setStep("act");
              }}
            >
              <div className="w-full text-left">
                <label htmlFor="reflection" className="sr-only">
                  Your reflection (optional)
                </label>
                <textarea
                  id="reflection"
                  value={reflection}
                  onChange={(event) => setReflection(event.target.value)}
                  maxLength={REFLECTION_LIMIT}
                  rows={4}
                  placeholder="A word, a sentence, anything at all."
                  className="w-full resize-none rounded-2xl border border-foreground/20 bg-transparent px-5 py-4 text-base leading-7 placeholder:text-foreground/40"
                />
                <p className="mt-2 px-1 text-xs text-foreground/50">
                  Optional. This stays on this screen and isn&apos;t saved.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Button type="submit">Continue</Button>
                <Button variant="ghost" onClick={() => setStep("act")}>
                  Skip
                </Button>
              </div>
            </form>
          </section>
        )}

        {step === "act" && (
          <section className="w-full" aria-labelledby="act-title">
            <h1 id="act-title" ref={headingRef} tabIndex={-1} className={heading}>
              Is there one small thing you&apos;d like to do, away from the screen?
            </h1>
            <form
              className="mt-8 flex flex-col items-center gap-6"
              onSubmit={(event) => {
                event.preventDefault();
                if (canChoose) setStep("close");
              }}
            >
              <fieldset className="w-full">
                <legend className="sr-only">Choose one small action</legend>
                <div className="grid gap-3 text-left">
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
                  <div className="mt-3 text-left">
                    <label htmlFor="custom-action" className="sr-only">
                      Your own action
                    </label>
                    <input
                      id="custom-action"
                      type="text"
                      value={customAction}
                      onChange={(event) => setCustomAction(event.target.value)}
                      maxLength={120}
                      placeholder="What feels right for you?"
                      className="min-h-11 w-full rounded-2xl border border-foreground/20 bg-transparent px-5 text-base placeholder:text-foreground/40"
                    />
                  </div>
                )}
              </fieldset>
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Button type="submit" disabled={!canChoose}>
                  Choose this
                </Button>
                <Button variant="ghost" onClick={() => setStep("close")}>
                  Skip
                </Button>
              </div>
            </form>
          </section>
        )}

        {step === "close" && (
          <section className="flex flex-col items-center" aria-labelledby="close-title">
            <BreathingOrb className="mb-10" />
            <h1 id="close-title" ref={headingRef} tabIndex={-1} className={heading}>
              Thank you for pausing.
            </h1>
            {chosenText ? (
              <p className="mt-4 max-w-sm text-base leading-7 text-foreground/70">
                When you&apos;re ready: {chosenText}
              </p>
            ) : (
              <p className="mt-4 max-w-sm text-base leading-7 text-foreground/70">
                Carry this quiet with you.
              </p>
            )}
            <p className="mt-8 text-sm text-foreground/50">Go gently.</p>
            <div className="mt-10">
              <Link href="/" className={buttonClass("quiet")}>
                Done
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
