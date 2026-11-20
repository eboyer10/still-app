"use client";

import { useState, type ChangeEvent } from "react";
import Button from "@/components/ui/Button";
import { ENTRY_FIELDS, SOURCE_LABELS, displayDate, displayReading, type Entry, type EntryKind } from "@/lib/health";
import { CSV_TEMPLATE, readHealthFile } from "@/lib/healthImport";
import { saveImportedEntries } from "@/lib/healthStore";

const sources = ["apple-health", "csv"] as const;
type ImportSource = (typeof sources)[number];
const instructions: Record<ImportSource, string> = {
  "apple-health": "In the iPhone Health app, open your profile and choose Export All Health Data. Select the ZIP or its export.xml file (up to 32 MB). Still reads the latest 30 days of workouts, sleep, water, and supported readings, up to 100 entries per type.",
  csv: "Use the template for up to 500 entries from a spreadsheet or another app. Supported kinds are movement, food, sleep, visit, and measurement. Use YYYY-MM-DD for dates, hours for sleep, and HH:MM for an optional time.",
};

export default function HealthImport() {
  const [records, setRecords] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<EntryKind[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const groups = [...new Set(records.map((entry) => entry.kind))];
  const selectedRecords = records.filter((entry) => selected.includes(entry.kind));

  async function choose(event: ChangeEvent<HTMLInputElement>, source: ImportSource) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setRecords([]);
    setSelected([]);
    setMessage("");
    setError("");
    setBusy(true);
    try {
      const parsed = await readHealthFile(file, source);
      setRecords(parsed);
      setMessage(parsed.length ? "File ready. Choose what to keep below." : "No supported entries were found in this file.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Still couldn’t read this file.");
    } finally {
      setBusy(false);
    }
  }

  async function commit() {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const added = await saveImportedEntries(selectedRecords);
      setRecords([]);
      setSelected([]);
      const duplicates = selectedRecords.length - added;
      setMessage(added
        ? `Saved ${added} ${added === 1 ? "entry" : "entries"}.${duplicates ? ` ${duplicates} already saved.` : ""}`
        : "These entries are already saved.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Still couldn’t save these entries.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5">
      <div className="grid gap-3">
        {sources.map((source) => (
          <section key={source} className="min-w-0 rounded-2xl border border-white/15 bg-white/[0.055] p-4">
            <h3 className="font-display text-lg">{SOURCE_LABELS[source]}</h3>
            <p className="mt-1 text-sm leading-6 text-foreground/80">{instructions[source]}</p>
            {source === "csv" && (
              <a download="still-import-template.csv" href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`} className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">
                Download CSV template
              </a>
            )}
            <label className="mt-3 block text-sm font-medium">
              Choose {SOURCE_LABELS[source]}
              <input type="file" disabled={busy} accept={source === "csv" ? ".csv,text/csv" : ".zip,.xml,application/zip,text/xml"} onChange={(event) => void choose(event, source)} className="mt-2 block min-h-11 w-full min-w-0 text-sm text-foreground/80 file:mr-3 file:min-h-11 file:rounded-full file:border file:border-white/25 file:bg-white/8 file:px-4 file:text-foreground hover:file:bg-white/15" />
            </label>
          </section>
        ))}
      </div>

      <p role="status" className={message || busy ? "mt-3 text-sm text-foreground/85" : "sr-only"}>{busy ? "Working with your file…" : message}</p>
      {error && <p role="alert" className="mt-3 text-sm text-[#ffd4bf]">{error}</p>}
      {records.length > 0 && (
        <fieldset disabled={busy} className="mt-5 rounded-2xl border border-white/15 p-4">
          <legend className="px-1 font-display text-lg">Choose records to import</legend>
          <div className="space-y-2">
            {groups.map((kind) => {
              const items = records.filter((entry) => entry.kind === kind);
              const first = items[0];
              const summary = [first.title, displayReading(first), displayDate(first.date)].filter(Boolean).join(" · ");
              return (
                <label key={kind} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl bg-white/7 p-3">
                  <input type="checkbox" checked={selected.includes(kind)} onChange={(event) => {
                    const checked = event.target.checked;
                    setSelected((previous) => checked ? [...previous, kind] : previous.filter((item) => item !== kind));
                  }} className="mt-1 size-4 shrink-0 accent-foreground" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{ENTRY_FIELDS[kind].plural} ({items.length})</span>
                    <span className="block break-words text-xs leading-5 text-foreground/80">Example · {summary}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <Button variant="quiet" className="mt-4 text-sm" disabled={!selectedRecords.length || busy} onClick={() => void commit()}>
            {selectedRecords.length ? `Import ${selectedRecords.length} ${selectedRecords.length === 1 ? "entry" : "entries"}` : "Import selected entries"}
          </Button>
        </fieldset>
      )}
    </div>
  );
}
