"use client";

import { useSyncExternalStore } from "react";

export type ReminderFrequency = "off" | "daily" | "few-per-week" | "weekdays";

export type Preferences = {
  reminderFrequency: ReminderFrequency;
  /** 24-hour "HH:MM" */
  windowStart: string;
  windowEnd: string;
  inAppReminders: boolean;
  /** Soft tone that follows the breath. On by default, only ever started by a tap, and easy to mute. */
  sound: boolean;
  /** A tiny vibration at each breath phase, on phones that support it. Off unless chosen. */
  haptics: boolean;
  /** The short first-run note on the home screen has been dismissed. */
  introSeen: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  reminderFrequency: "off",
  windowStart: "09:00",
  windowEnd: "17:00",
  inAppReminders: true,
  sound: true,
  haptics: false,
  introSeen: false,
};

const STORAGE_KEY = "still:preferences";
const FREQUENCIES: ReminderFrequency[] = ["off", "daily", "few-per-week", "weekdays"];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function parse(raw: string | null): Preferences {
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    const data = JSON.parse(raw) as Partial<Preferences>;
    return {
      reminderFrequency: FREQUENCIES.includes(data.reminderFrequency as ReminderFrequency)
        ? (data.reminderFrequency as ReminderFrequency)
        : DEFAULT_PREFERENCES.reminderFrequency,
      windowStart: TIME_PATTERN.test(data.windowStart ?? "")
        ? (data.windowStart as string)
        : DEFAULT_PREFERENCES.windowStart,
      windowEnd: TIME_PATTERN.test(data.windowEnd ?? "")
        ? (data.windowEnd as string)
        : DEFAULT_PREFERENCES.windowEnd,
      inAppReminders:
        typeof data.inAppReminders === "boolean"
          ? data.inAppReminders
          : DEFAULT_PREFERENCES.inAppReminders,
      sound: typeof data.sound === "boolean" ? data.sound : DEFAULT_PREFERENCES.sound,
      haptics: typeof data.haptics === "boolean" ? data.haptics : DEFAULT_PREFERENCES.haptics,
      introSeen: typeof data.introSeen === "boolean" ? data.introSeen : DEFAULT_PREFERENCES.introSeen,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

// useSyncExternalStore needs a referentially stable snapshot, so cache the
// parsed value and only re-parse when the stored string changes.
let cachedRaw: string | null | undefined;
let cachedValue: Preferences = DEFAULT_PREFERENCES;
let writeFailed = false; // e.g. storage blocked: keep working in memory
const listeners = new Set<() => void>();

function getSnapshot(): Preferences {
  if (writeFailed) return cachedValue;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedValue = parse(raw);
    }
  } catch {
    // Storage unavailable: fall back to the last known value.
  }
  return cachedValue;
}

function getServerSnapshot(): Preferences {
  return DEFAULT_PREFERENCES;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function updatePreferences(patch: Partial<Preferences>) {
  const next = { ...getSnapshot(), ...patch };
  cachedValue = next;
  try {
    const raw = JSON.stringify(next);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    writeFailed = false;
  } catch {
    writeFailed = true;
  }
  listeners.forEach((listener) => listener());
}

export function usePreferences() {
  const preferences = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [preferences, updatePreferences] as const;
}
