"use client";

import { useSyncExternalStore } from "react";
import { getMood } from "@/lib/moods";

export type FollowUpStatus = "did-it" | "not-yet" | "priorities-changed";

export const FOLLOW_UP_LABELS: Record<FollowUpStatus, string> = {
  "did-it": "I did it",
  "not-yet": "Not yet",
  "priorities-changed": "My priorities changed",
};

export const REFLECTION_LIMIT = 280;
export const INTENTION_LIMIT = 120;

export type Intention = {
  source: "preset" | "custom";
  /** Links to MOMENT_ACTIONS for presets. */
  presetId?: string;
  /** Snapshot of the wording at the time, so later copy edits never rewrite history. */
  text: string;
  followUp?: { status: FollowUpStatus; at: string };
};

export type Moment = {
  id: string;
  /** ISO timestamp */
  completedAt: string;
  /** true = the full 30 seconds; false = the person skipped ahead. */
  breathCompleted: boolean;
  /** The feeling the person arrived with (a mood id), if they chose one. */
  mood?: string;
  /** Present only if the person wrote one. */
  reflection?: { text: string; editedAt?: string };
  /** Present only if the person chose one. */
  intention?: Intention;
};

type JourneyData = { version: 1; moments: Moment[] };

export type NewMoment = {
  breathCompleted: boolean;
  mood?: string | null;
  reflection?: string;
  intention?: { source: "preset" | "custom"; presetId?: string; text: string };
};

const STORAGE_KEY = "still:journey";
/** Holds the original text if a read ever had to migrate or skip records. */
const BACKUP_KEY = "still:journey:backup";
const CURRENT_VERSION = 1;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFollowUpStatus = (value: unknown): value is FollowUpStatus =>
  typeof value === "string" && value in FOLLOW_UP_LABELS;

function parseIntention(value: unknown): Intention | undefined {
  if (!isRecord(value)) return undefined;
  const { source, presetId, text, followUp } = value;
  if ((source !== "preset" && source !== "custom") || typeof text !== "string" || !text.trim()) {
    return undefined;
  }
  const intention: Intention = { source, text };
  if (typeof presetId === "string") intention.presetId = presetId;
  if (isRecord(followUp) && isFollowUpStatus(followUp.status) && typeof followUp.at === "string") {
    intention.followUp = { status: followUp.status, at: followUp.at };
  }
  return intention;
}

function parseMoment(value: unknown): Moment | null {
  if (!isRecord(value)) return null;
  const { id, completedAt, breathCompleted, reflection, intention, mood } = value;
  if (typeof id !== "string" || !id) return null;
  if (typeof completedAt !== "string" || Number.isNaN(Date.parse(completedAt))) return null;
  if (typeof breathCompleted !== "boolean") return null;

  const moment: Moment = { id, completedAt, breathCompleted };
  if (typeof mood === "string" && getMood(mood)) moment.mood = mood;
  if (isRecord(reflection) && typeof reflection.text === "string" && reflection.text.trim()) {
    moment.reflection = { text: reflection.text };
    if (typeof reflection.editedAt === "string") moment.reflection.editedAt = reflection.editedAt;
  }
  const parsedIntention = parseIntention(intention);
  if (parsedIntention) moment.intention = parsedIntention;
  return moment;
}

const newestFirst = (a: Moment, b: Moment) => Date.parse(b.completedAt) - Date.parse(a.completedAt);

/**
 * Reads the stored text into moments. Nothing is invented: invalid records are
 * skipped (and the original is backed up before the next write), never repaired.
 */
export function parseJourney(raw: string | null): { moments: Moment[]; needsBackup: boolean } {
  if (!raw) return { moments: [], needsBackup: false };
  try {
    const data: unknown = JSON.parse(raw);
    // Version 0 (prototype shapes): a bare array, or an object without a version.
    const list = Array.isArray(data)
      ? data
      : isRecord(data) && Array.isArray(data.moments)
        ? data.moments
        : null;
    if (!list) return { moments: [], needsBackup: true };

    const moments = list.map(parseMoment).filter((m): m is Moment => m !== null);
    const migrated = !(isRecord(data) && data.version === CURRENT_VERSION);
    return {
      moments: moments.sort(newestFirst),
      needsBackup: migrated || moments.length !== list.length,
    };
  } catch {
    return { moments: [], needsBackup: true };
  }
}

// ---- store (same shape as preferences.ts) ----

const EMPTY: Moment[] = [];
let cachedRaw: string | null | undefined;
let cached: Moment[] = EMPTY;
let pendingBackup: string | null = null;
let memoryOnly = false; // storage blocked: keep working in memory
const listeners = new Set<() => void>();

function read(): Moment[] {
  if (memoryOnly) return cached;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      const result = parseJourney(raw);
      cached = result.moments.length ? result.moments : EMPTY;
      pendingBackup = result.needsBackup ? raw : null;
    }
  } catch {
    // Storage unavailable: keep the last known value.
  }
  return cached;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

const emit = () => listeners.forEach((listener) => listener());

/** Returns false if the browser wouldn't let us save (data then lives in memory only). */
function write(next: Moment[]): boolean {
  cached = next.length ? [...next].sort(newestFirst) : EMPTY;
  let ok = true;
  try {
    if (pendingBackup !== null && window.localStorage.getItem(BACKUP_KEY) === null) {
      window.localStorage.setItem(BACKUP_KEY, pendingBackup);
    }
    pendingBackup = null;
    const raw = JSON.stringify({ version: CURRENT_VERSION, moments: cached } satisfies JourneyData);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    memoryOnly = false;
  } catch {
    ok = false;
    memoryOnly = true;
  }
  emit();
  return ok;
}

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

function change(id: string, edit: (moment: Moment) => Moment) {
  write(read().map((moment) => (moment.id === id ? edit(moment) : moment)));
}

export function addMoment(input: NewMoment): boolean {
  const moment: Moment = {
    id: makeId(),
    completedAt: new Date().toISOString(),
    breathCompleted: input.breathCompleted,
  };
  if (input.mood && getMood(input.mood)) moment.mood = input.mood;
  const reflection = input.reflection?.trim();
  if (reflection) moment.reflection = { text: reflection };
  const text = input.intention?.text.trim();
  if (input.intention && text) {
    moment.intention = { source: input.intention.source, text };
    if (input.intention.presetId) moment.intention.presetId = input.intention.presetId;
  }
  return write([...read(), moment]);
}

export function editReflection(id: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  change(id, (m) => ({
    ...m,
    reflection: { text: trimmed.slice(0, REFLECTION_LIMIT), editedAt: new Date().toISOString() },
  }));
}

export function removeReflection(id: string) {
  change(id, (m) => {
    const next = { ...m };
    delete next.reflection;
    return next;
  });
}

/** Editing the words makes it the person's own intention, so it no longer claims to be a preset. */
export function editIntention(id: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  change(id, (m) =>
    m.intention
      ? { ...m, intention: { source: "custom", text: trimmed.slice(0, INTENTION_LIMIT), followUp: m.intention.followUp } }
      : m,
  );
}

export function removeIntention(id: string) {
  change(id, (m) => {
    const next = { ...m };
    delete next.intention;
    return next;
  });
}

export function setFollowUp(id: string, status: FollowUpStatus | null) {
  change(id, (m) => {
    if (!m.intention) return m;
    const intention = { ...m.intention };
    delete intention.followUp;
    if (status) intention.followUp = { status, at: new Date().toISOString() };
    return { ...m, intention };
  });
}

export function removeMoment(id: string) {
  write(read().filter((moment) => moment.id !== id));
}

/** Deletes everything, including the migration backup. */
export function clearJourney() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(BACKUP_KEY);
  } catch {
    // Nothing stored that we could remove.
  }
  cachedRaw = null;
  pendingBackup = null;
  memoryOnly = false;
  cached = EMPTY;
  emit();
}

// ---- derived values (computed on read, never stored) ----

export type JourneyCounts = {
  momentsTaken: number;
  intentionsChosen: number;
  /** Any follow-up recorded, including "Not yet" and "My priorities changed". */
  intentionsRevisited: number;
  /** Only "I did it". */
  intentionsActedOn: number;
};

export function getJourneyCounts(moments: Moment[]): JourneyCounts {
  const intentions = moments.flatMap((m) => (m.intention ? [m.intention] : []));
  return {
    momentsTaken: moments.length,
    intentionsChosen: intentions.length,
    intentionsRevisited: intentions.filter((i) => i.followUp).length,
    intentionsActedOn: intentions.filter((i) => i.followUp?.status === "did-it").length,
  };
}

const subscribeNever = () => () => {};

/** `ready` is false during server render and hydration, so the UI never flashes an empty state. */
export function useJourney() {
  const moments = useSyncExternalStore(subscribe, read, () => EMPTY);
  const ready = useSyncExternalStore(subscribeNever, () => true, () => false);
  return { moments, ready };
}
