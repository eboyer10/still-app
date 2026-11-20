import { compareEntries, dateKey, isEntryKind, validateEntry, type Entry } from "@/lib/health";

type Draft = Omit<Entry, "id">;
type AppleDraft = Draft & { source: "apple-health"; key: string };

const XML_LIMIT = 32 * 1024 * 1024;
const CSV_LIMIT = 1024 * 1024;
const RECENT_DAYS = 30;
const CSV_HEADER = "kind,date,title,value,notes,time";
export const CSV_TEMPLATE = CSV_HEADER + "\nmovement,2026-01-01,Walk,20 min,Fresh air,\nsleep,2026-01-02,Sleep,7.5,,\n";

function csvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let closed = false;
  for (let i = 0; i <= text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
        closed = true;
      } else if (char === undefined) {
        throw new Error("Close the quoted field in your CSV file.");
      } else {
        field += char;
      }
    } else if (char === undefined || char === "," || char === "\r" || char === "\n") {
      row.push(field.trim());
      field = "";
      closed = false;
      if (char !== ",") {
        if (row.some(Boolean)) rows.push(row);
        row = [];
        if (char === "\r" && text[i + 1] === "\n") i++;
      }
    } else if (char === '"' && !field && !closed) {
      quoted = true;
    } else if (char === '"' || closed) {
      throw new Error("Check the quotation marks in your CSV file.");
    } else {
      field += char;
    }
  }
  return rows;
}

function fromCsv(text: string): Draft[] {
  const [header, ...rows] = csvRows(text.replace(/^\uFEFF/, ""));
  if (header?.join(",") !== CSV_HEADER) {
    throw new Error("Use the template’s column names and order. Leave optional cells blank.");
  }
  if (rows.length > 500) throw new Error("Import up to 500 CSV entries at a time.");
  return rows.map(([kind, date, title, value, notes, time], index) => {
    if (rows[index].length !== header.length || !isEntryKind(kind)) {
      throw new Error(`CSV entry ${index + 1} needs a supported kind and all six columns.`);
    }
    const draft = { kind, date, title, value, notes, time, source: "csv" } as const;
    const error = validateEntry(draft);
    if (error) throw new Error(`CSV entry ${index + 1}. ${error}`);
    return draft;
  });
}

async function appleXml(file: File) {
  if (file.size > XML_LIMIT) throw new Error("Choose an Apple Health export smaller than 32 MB, or use a CSV file.");
  if (!file.name.toLowerCase().endsWith(".zip")) return file.text();

  const { unzipSync, strFromU8 } = await import("fflate");
  let archive: ReturnType<typeof unzipSync>;
  let matchingFiles = 0;
  let oversized = false;
  try {
    archive = unzipSync(new Uint8Array(await file.arrayBuffer()), {
      filter: ({ name, originalSize }) => {
        if (!/(^|\/)export\.xml$/.test(name)) return false;
        matchingFiles++;
        oversized ||= originalSize > XML_LIMIT;
        return matchingFiles === 1 && !oversized;
      },
    });
  } catch {
    throw new Error("Still couldn’t open this ZIP. Try a fresh Apple Health export.");
  }
  if (oversized) throw new Error("The export.xml inside this ZIP exceeds 32 MB. Try importing a CSV file.");
  if (matchingFiles !== 1) throw new Error("Choose an Apple Health ZIP containing one export.xml file.");
  return strFromU8(Object.values(archive)[0]);
}

const APPLE_TYPES: Record<string, { kind: Entry["kind"]; title: string }> = {
  HKQuantityTypeIdentifierDietaryWater: { kind: "food", title: "Water" },
  HKQuantityTypeIdentifierBodyMass: { kind: "measurement", title: "Weight" },
  HKQuantityTypeIdentifierHeartRate: { kind: "measurement", title: "Heart rate" },
  HKQuantityTypeIdentifierBloodGlucose: { kind: "measurement", title: "Blood glucose" },
  HKQuantityTypeIdentifierBloodPressureSystolic: { kind: "measurement", title: "Systolic blood pressure" },
  HKQuantityTypeIdentifierBloodPressureDiastolic: { kind: "measurement", title: "Diastolic blood pressure" },
};

function appleDate(value: string) {
  return Date.parse(value.replace(" ", "T").replace(/ ([+-]\d{2})(\d{2})$/, "$1:$2"));
}

function fromAppleHealth(text: string): AppleDraft[] {
  // Apple includes an internal DTD describing its schema. The records only use normal XML attributes.
  const xml = text.replace(/<!DOCTYPE\s+HealthData\s*\[[\s\S]*?\]\s*>/, "");
  if (/<!DOCTYPE/i.test(xml)) throw new Error("This XML does not look like an Apple Health export.");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.documentElement.localName !== "HealthData" || doc.querySelector("parsererror")) {
    throw new Error("This XML does not look like an Apple Health export.");
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (RECENT_DAYS - 1));
  const cutoffDate = dateKey(cutoff);
  const drafts: AppleDraft[] = [];
  const sleep: { start: number; end: number; localEnd: string }[] = [];

  for (const node of doc.documentElement.children) {
    if (node.localName !== "Record" && node.localName !== "Workout") continue;
    const attr = (name: string) => node.getAttribute(name) ?? "";
    const start = attr("startDate");
    const end = attr("endDate");
    const date = start.slice(0, 10);
    const type = attr("type");
    const value = attr("value");

    if (type === "HKCategoryTypeIdentifierSleepAnalysis") {
      if (end.slice(0, 10) < cutoffDate || !/^HKCategoryValueSleepAnalysisAsleep(?:Unspecified|Core|Deep|REM)?$/.test(value)) continue;
      const span = { start: appleDate(start), end: appleDate(end), localEnd: end };
      if (span.end > span.start) sleep.push(span);
      continue;
    }
    if (date < cutoffDate) continue;

    const base = { source: "apple-health" as const, date, time: start.slice(11, 16), notes: "" };
    if (node.localName === "Workout") {
      const workout = attr("workoutActivityType");
      const name = workout.replace(/^HKWorkoutActivityType/, "").replace(/([a-z])([A-Z])/g, "$1 $2");
      const duration = Number(attr("duration"));
      const unit = attr("durationUnit");
      drafts.push({ ...base, kind: "movement", title: name || "Workout", value: Number.isFinite(duration) && duration > 0 && unit ? `${Number(duration.toFixed(1))} ${unit}` : "", key: JSON.stringify([workout, start, end, attr("sourceName")]) });
    } else if (Object.hasOwn(APPLE_TYPES, type) && value && Number.isFinite(Number(value))) {
      drafts.push({ ...base, ...APPLE_TYPES[type], value: `${value} ${attr("unit")}`.trim(), key: JSON.stringify([type, start, end, value, attr("unit"), attr("sourceName")]) });
    }
  }

  sleep.sort((a, b) => a.start - b.start);
  let session: { start: number; end: number; localEnd: string; asleep: number } | undefined;
  function addSleep() {
    if (!session) return;
    const hours = Math.round(session.asleep / 36_000) / 100;
    drafts.push({
      kind: "sleep", title: "Sleep", value: String(hours), notes: "", source: "apple-health",
      date: session.localEnd.slice(0, 10), time: session.localEnd.slice(11, 16),
      key: JSON.stringify(["sleep", session.start, session.end]),
    });
  }
  for (const span of sleep) {
    if (!session || span.start > session.end + 90 * 60_000) {
      addSleep();
      session = { ...span, asleep: span.end - span.start };
    } else if (span.end > session.end) {
      session.asleep += span.end - Math.max(span.start, session.end);
      session.end = span.end;
      session.localEnd = span.localEnd;
    }
  }
  addSleep();

  // Keep the newest records per kind so a watch’s frequent samples don’t fill browser storage.
  const counts = new Map<Entry["kind"], number>();
  const seen = new Set<string>();
  return drafts.sort((a, b) => compareEntries(b, a)).filter((draft) => {
    const count = counts.get(draft.kind) ?? 0;
    if (count >= 100 || seen.has(draft.key) || validateEntry(draft)) return false;
    counts.set(draft.kind, count + 1);
    seen.add(draft.key);
    return true;
  });
}

export async function readHealthFile(file: File, source: Exclude<Entry["source"], "manual">): Promise<Entry[]> {
  let drafts: (Draft | AppleDraft)[];
  if (source === "csv") {
    if (file.size > CSV_LIMIT) throw new Error("Choose a CSV file smaller than 1 MB.");
    drafts = fromCsv(await file.text());
  } else {
    drafts = fromAppleHealth(await appleXml(file));
  }

  const entries = await Promise.all(drafts.map(async (draft) => {
    const { key, ...entry } = draft as Draft & { key?: string };
    const data = new TextEncoder().encode(key ?? JSON.stringify(entry));
    const hash = await crypto.subtle.digest("SHA-256", data);
    const id = `${source}:${Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
    return { ...entry, id };
  }));
  return [...new Map(entries.map((entry) => [entry.id, entry])).values()];
}
