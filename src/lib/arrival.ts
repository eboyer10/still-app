"use client";

import { useMemo, useSyncExternalStore } from "react";
import { MOODS, NEUTRAL_HUE, getMood, type Mood, type ShapeKind } from "@/lib/moods";

/* ---------- Mood: chosen on Today, kept for this visit only ---------- */

const MOOD_KEY = "still:mood";
const moodListeners = new Set<() => void>();
let moodMemory: string | null = null;

function readMood(): string | null {
  let raw = moodMemory;
  try {
    raw = window.sessionStorage.getItem(MOOD_KEY) ?? moodMemory;
  } catch {
    // Storage blocked: the in-memory value still works for this page.
  }
  return MOODS.some((m) => m.id === raw) ? raw : null;
}

function setMood(id: string) {
  moodMemory = id;
  try {
    window.sessionStorage.setItem(MOOD_KEY, id);
  } catch {
    // Keep working in memory.
  }
  moodListeners.forEach((listener) => listener());
}

function subscribeMood(listener: () => void) {
  moodListeners.add(listener);
  return () => {
    moodListeners.delete(listener);
  };
}

export function useMood() {
  const id = useSyncExternalStore(subscribeMood, readMood, () => null);
  return [id, setMood] as const;
}

/* ---------- A different shape each time the page loads, until a feeling is chosen ---------- */

let randomKind: ShapeKind | null = null;

function getRandomKind(): ShapeKind {
  randomKind ??= Math.random() < 0.5 ? "geometry" : "bloom";
  return randomKind;
}

const subscribeNever = () => () => {};

export type Shape = { kind: ShapeKind; n: number; hue: number; mood: Mood | null };

/** The breathing shape: the chosen feeling's own, or a random one for this page load. */
export function useShape(): Shape {
  const [id] = useMood();
  const random = useSyncExternalStore(subscribeNever, getRandomKind, () => "geometry" as ShapeKind);
  return useMemo(() => {
    const mood = getMood(id);
    return mood
      ? { kind: mood.kind, n: mood.n, hue: mood.hue, mood }
      : { kind: random, n: 8, hue: NEUTRAL_HUE, mood: null };
  }, [id, random]);
}
