"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { dateKey, ENTRY_FIELDS, type Entry, type EntryKind } from "@/lib/health";
import { saveEntry } from "@/lib/healthStore";

const inputClass = "mt-2 block min-h-11 w-full rounded-xl border border-white/20 bg-background/60 px-3 py-2 text-base text-foreground placeholder:text-foreground/55";

export default function EntryForm({ kind, entry, quick = false, onClose }: {
  kind: EntryKind;
  entry?: Entry;
  quick?: boolean;
  onClose: (message?: string) => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fields = ENTRY_FIELDS[kind];
  useEffect(() => { heading.current?.focus(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim();
    setBusy(true);
    setError("");
    try {
      await saveEntry({
        kind,
        title: get("title") || (kind === "sleep" ? "Sleep" : ""),
        date: get("date"),
        time: kind === "visit" || entry?.time ? get("time") : "",
        value: get("value"),
        notes: get("notes"),
      }, entry?.id);
      onClose(entry ? "Changes saved." : "Entry saved.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Still couldn’t save this entry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 w-full max-w-3xl rounded-3xl text-left border border-white/15 bg-white/[0.06] p-5 sm:p-7" aria-labelledby="entry-form-title">
      <h2 id="entry-form-title" ref={heading} tabIndex={-1} className="font-display text-2xl">
        {entry ? "Edit" : "Add"} {fields.singular}
      </h2>

      <fieldset disabled={busy} className="mt-5 grid gap-4 sm:grid-cols-2">
        {!(quick && kind === "sleep") && <label className="text-sm">
          {fields.title}
          <input className={inputClass} name="title" defaultValue={entry?.title} placeholder={fields.placeholder} maxLength={100} required={kind !== "sleep"} />
        </label>}
        <label className="text-sm">
          {kind === "sleep" ? "Date you woke up" : "Date"}
          <input className={inputClass} name="date" type="date" defaultValue={entry?.date ?? dateKey()} required />
        </label>
        {(kind === "visit" || entry?.time) && (
          <label className="text-sm">
            Time (optional)
            <input className={inputClass} name="time" type="time" defaultValue={entry?.time} />
          </label>
        )}
        {fields.value && (!quick || fields.required) && (
          <label className="text-sm">
            {fields.value}
            {kind === "sleep" ? (
              <input className={inputClass} name="value" type="number" min="0.01" max="24" step="any" defaultValue={entry?.value} required />
            ) : (
              <input className={inputClass} name="value" defaultValue={entry?.value} maxLength={80} required={fields.required} />
            )}
          </label>
        )}
        {!quick && <label className="text-sm sm:col-span-2">
          {kind === "visit" ? "Questions or notes (optional)" : "Notes (optional)"}
          <textarea className={inputClass} name="notes" rows={3} maxLength={500} defaultValue={entry?.notes} />
        </label>}
      </fieldset>
      {error && <p role="alert" className="mt-4 text-sm text-[#ffd4bf]">{error}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save entry"}</Button>
        <Button variant="ghost" disabled={busy} onClick={() => onClose()}>{quick ? "Choose another area" : "Cancel"}</Button>
      </div>
    </form>
  );
}
