"use client";

import { useEffect, useRef } from "react";

/** Total length of the guided breath. */
export const BREATH_DURATION_MS = 30_000;
const INHALE_S = 4;
const EXHALE_S = 4;
const CYCLE_S = INHALE_S + EXHALE_S;
/** The last two seconds ease the orb to rest instead of cutting mid-exhale. */
const SETTLE_AT_MS = BREATH_DURATION_MS - 2_000;

export type BreathCue = "in" | "out" | "settle";

const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);

/** 0 = fully rested, 1 = fully expanded. */
export function breathValue(ms: number): number {
  if (ms >= SETTLE_AT_MS) {
    return 1 - ease(Math.min((ms - SETTLE_AT_MS) / 2_000, 1));
  }
  const t = (ms / 1000) % CYCLE_S;
  return t < INHALE_S ? ease(t / INHALE_S) : 1 - ease((t - INHALE_S) / EXHALE_S);
}

export function breathCue(ms: number): BreathCue {
  if (ms >= SETTLE_AT_MS) return "settle";
  return (ms / 1000) % CYCLE_S < INHALE_S ? "in" : "out";
}

type TimerOptions = {
  durationMs: number;
  running: boolean;
  onFrame: (elapsedMs: number) => void;
  onComplete: () => void;
};

/**
 * Frame-driven timer that only accumulates time while `running`. Callbacks
 * fire outside React state so the orb can animate without re-rendering.
 */
export function useBreathTimer({ durationMs, running, onFrame, onComplete }: TimerOptions) {
  const elapsed = useRef(0);
  const callbacks = useRef({ onFrame, onComplete });

  useEffect(() => {
    callbacks.current = { onFrame, onComplete };
  });

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let previous: number | null = null;

    const tick = (now: number) => {
      if (previous !== null) {
        // Clamp so a throttled frame never skips a chunk of the breath.
        elapsed.current += Math.min(now - previous, 100);
      }
      previous = now;
      const ms = Math.min(elapsed.current, durationMs);
      callbacks.current.onFrame(ms);
      if (ms >= durationMs) {
        callbacks.current.onComplete();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, durationMs]);
}
