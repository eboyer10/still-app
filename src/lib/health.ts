export const AREA_IDS = ["movement", "food", "sleep", "care"] as const;
export type AreaId = (typeof AREA_IDS)[number];

export const AREAS = {
  movement: { title: "Movement", description: "Make a note of how you moved.", color: "#aee9cd", empty: "Log a walk or workout", kinds: ["movement"] },
  food: { title: "Food & drink", description: "Remember what you ate and drank and how it felt.", color: "#f4c7a4", empty: "Note a meal or a drink", kinds: ["food"] },
  sleep: { title: "Sleep", description: "Keep a simple record of your rest.", color: "#d0c2ff", empty: "Note a night of rest", kinds: ["sleep"] },
  care: { title: "Care & monitoring", description: "Keep visits, questions, and readings in one place.", color: "#b5d9ff", empty: "Add a visit or a reading", kinds: ["visit", "measurement"] },
} as const satisfies Record<AreaId, { title: string; description: string; color: string; empty: string; kinds: readonly EntryKind[] }>;

export const ENTRY_FIELDS = {
  movement: { singular: "activity", plural: "Activities", title: "Activity", placeholder: "Walk, stretching, cycling…", value: "Duration or distance (optional)", required: false },
  food: { singular: "food or drink", plural: "Food & drink entries", title: "Food or drink", placeholder: "Lunch, a glass of water…", value: "Amount (optional)", required: false },
  sleep: { singular: "sleep entry", plural: "Sleep entries", title: "Label (optional)", placeholder: "Sleep", value: "Hours slept", required: true },
  visit: { singular: "visit", plural: "Visits", title: "Visit", placeholder: "Primary care, annual checkup…", value: "", required: false },
  measurement: { singular: "reading", plural: "Readings", title: "What did you measure?", placeholder: "Blood pressure, blood sugar…", value: "Reading and unit", required: true },
} as const;

export type EntryKind = keyof typeof ENTRY_FIELDS;
export type Source = "manual" | "apple-health" | "csv";
export type Entry = {
  id: string;
  kind: EntryKind;
  date: string;
  time: string;
  title: string;
  value: string;
  notes: string;
  source: Source;
};

export const SOURCE_LABELS = {
  "apple-health": "Apple Health export",
  csv: "CSV file",
} as const;

export const PROFILE_LIMIT = 500;

export type Profile = {
  focus: AreaId[];
  conditions: string;
  monitoring: string;
};

export const EMPTY_PROFILE: Profile = { focus: [], conditions: "", monitoring: "" };

export function isArea(value: unknown): value is AreaId {
  return AREA_IDS.some((id) => id === value);
}

export function isEntryKind(value: unknown): value is EntryKind {
  return typeof value === "string" && Object.hasOwn(ENTRY_FIELDS, value);
}

export function isDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return Number.isFinite(+parsed) && parsed.toISOString().slice(0, 10) === value;
}

export function dateKey(date = new Date()) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, "0"))
    .join("-");
}

export function displayDate(date: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(date + "T00:00:00Z"));
}

export function displayTime(time: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone: "UTC" })
    .format(new Date("2000-01-01T" + time + ":00Z"));
}

export function displayReading(entry: Entry) {
  if (entry.kind === "sleep") {
    const hours = Number(entry.value);
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  return entry.value;
}

type EntryDate = Pick<Entry, "date" | "time">;

export function compareEntries(a: EntryDate, b: EntryDate) {
  return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
}

export function validateEntry(input: Omit<Entry, "id" | "source">): string | null {
  const { kind, date, time, title, value, notes } = input;
  if (!isDate(date)) return "Enter a valid date.";
  if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return "Enter a valid time.";
  if (!title || title.length > 100) return "Enter a title of up to 100 characters.";
  if (value.length > 80 || notes.length > 500) return "Shorten the reading or note.";
  if (kind === "sleep" && (!value || !Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 24)) {
    return "Enter hours slept as a number between 0 and 24.";
  }
  if (kind === "measurement" && !value) return "Enter a reading and its unit.";
  return null;
}
