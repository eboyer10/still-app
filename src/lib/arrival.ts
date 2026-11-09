"use client";

import { useSyncExternalStore } from "react";
import { MOODS } from "@/lib/moods";

/* ---------- Mood: chosen when you arrive, kept for this visit only ---------- */

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

/* ---------- Visual: a different one each time the page loads ---------- */

export type Visual = "geometry" | "bloom";

let picked: Visual | null = null;

function getVisual(): Visual {
  picked ??= Math.random() < 0.5 ? "geometry" : "bloom";
  return picked;
}

const subscribeNever = () => () => {};

export function useVisual(): Visual {
  return useSyncExternalStore(subscribeNever, getVisual, () => "geometry");
}
