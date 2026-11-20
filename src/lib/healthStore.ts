"use client";

import { useSyncExternalStore } from "react";
import {
  EMPTY_PROFILE, isArea, isEntryKind, PROFILE_LIMIT, validateEntry,
  type Entry, type Profile,
} from "@/lib/health";

type HealthData = {
  version: 1;
  setupDone: boolean;
  profile: Profile;
  entries: Entry[];
};

const KEY = "still:health";
const EMPTY: HealthData = { version: 1, setupDone: false, profile: EMPTY_PROFILE, entries: [] };
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedSnapshot = EMPTY;

function isEntry(value: unknown): value is Entry {
  if (!value || typeof value !== "object") return false;
  const { id, kind, date, time, title, value: reading, notes, source } = value as Partial<Entry>;
  return typeof id === "string" && isEntryKind(kind) &&
    typeof date === "string" && typeof time === "string" && typeof title === "string" &&
    typeof reading === "string" && typeof notes === "string" &&
    (source === "manual" || source === "apple-health" || source === "csv") &&
    validateEntry({ kind, date, time, title, value: reading, notes }) === null;
}

function parse(raw: string | null): HealthData {
  if (raw === null) return EMPTY;
  const data = JSON.parse(raw) as Partial<HealthData> | null;
  if (data?.version !== 1 || !data.profile || !Array.isArray(data.entries) || !data.entries.every(isEntry)) {
    throw new Error("Still couldn’t read your saved health data. You can clear it in Settings.");
  }
  return {
    version: 1,
    setupDone: data.setupDone === true,
    profile: {
      focus: Array.isArray(data.profile.focus) ? [...new Set(data.profile.focus.filter(isArea))] : [],
      conditions: typeof data.profile.conditions === "string" ? data.profile.conditions.slice(0, PROFILE_LIMIT) : "",
      monitoring: typeof data.profile.monitoring === "string" ? data.profile.monitoring.slice(0, PROFILE_LIMIT) : "",
    },
    entries: data.entries,
  };
}

function snapshot() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw !== cachedRaw) {
      cachedSnapshot = parse(raw);
      cachedRaw = raw;
    }
    return cachedSnapshot;
  } catch {
    return EMPTY;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  function onStorage(event: StorageEvent) {
    if (event.key === KEY || event.key === null) listener();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function mutate<T>(action: () => T): Promise<T> {
  if (navigator.locks) return navigator.locks.request(KEY, action);
  return Promise.resolve().then(action);
}

async function change<T>(update: (data: HealthData) => { data: HealthData; result: T }) {
  return mutate(() => {
    let current: HealthData;
    try {
      current = parse(window.localStorage.getItem(KEY));
    } catch (error) {
      if (error instanceof DOMException || error instanceof SyntaxError) {
        throw new Error("Still couldn’t read health data from this browser.");
      }
      throw error;
    }
    const { data, result } = update(current);
    if (current !== data) {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(data));
      } catch {
        throw new Error("Still couldn’t save your data. Check this browser’s storage settings or free up space.");
      }
      listeners.forEach((listener) => listener());
    }
    return result;
  });
}

export function useHealth() {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

export function saveProfile(profile: Profile) {
  return change((data) => ({ data: { ...data, profile, setupDone: true }, result: undefined }));
}

export function saveEntry(input: Omit<Entry, "id" | "source">, existingId?: string) {
  return change((data) => {
    const error = validateEntry(input);
    if (error) throw new Error(error);

    const existing = data.entries.find((entry) => entry.id === existingId);
    if (existingId && !existing) throw new Error("This entry was removed. You can save a new one instead.");

    const entry = { ...input, id: existing?.id ?? crypto.randomUUID(), source: existing?.source ?? "manual" } as const;
    const entries = existing
      ? data.entries.map((item) => item.id === existingId ? entry : item)
      : [...data.entries, entry];
    return { data: { ...data, entries }, result: undefined };
  });
}

export function deleteEntry(id: string) {
  return change((data) => ({
    data: { ...data, entries: data.entries.filter((entry) => entry.id !== id) },
    result: undefined,
  }));
}

export function saveImportedEntries(imported: Entry[]) {
  return change((data) => {
    const saved = new Set(data.entries.map((entry) => entry.id));
    const entries = imported.filter((entry) => {
      if (saved.has(entry.id)) return false;
      saved.add(entry.id);
      return true;
    });
    return {
      data: entries.length ? { ...data, entries: [...data.entries, ...entries] } : data,
      result: entries.length,
    };
  });
}

export function clearHealth() {
  return mutate(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      throw new Error("Still couldn’t clear health data. Check this browser’s storage settings.");
    }
    listeners.forEach((listener) => listener());
  });
}
