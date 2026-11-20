"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import HealthIcon from "@/components/health/HealthIcon";
import {
  AREAS, ENTRY_FIELDS, SOURCE_LABELS, compareEntries, dateKey, displayDate, displayReading, displayTime,
  type AreaId, type Entry, type EntryKind,
} from "@/lib/health";
import { deleteEntry, saveEntry, useHealth } from "@/lib/healthStore";

const inputClass = "mt-2 block min-h-11 w-full rounded-xl border border-white/20 bg-background/60 px-3 py-2 text-base text-foreground placeholder:text-foreground/55";

function EntryForm({ kind, entry, onClose }: { kind: EntryKind; entry?: Entry; onClose: (message?: string) => void }) {
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
    <form onSubmit={submit} className="mt-7 rounded-3xl border border-white/15 bg-white/[0.06] p-5 sm:p-7" aria-labelledby="entry-form-title">
      <h2 id="entry-form-title" ref={heading} tabIndex={-1} className="font-display text-2xl">
        {entry ? "Edit" : "Add"} {fields.singular}
      </h2>

      <fieldset disabled={busy} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          {fields.title}
          <input className={inputClass} name="title" defaultValue={entry?.title} placeholder={fields.placeholder} maxLength={100} required={kind !== "sleep"} />
        </label>
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
        {fields.value && (
          <label className="text-sm">
            {fields.value}
            {kind === "sleep" ? (
              <input className={inputClass} name="value" type="number" min="0.01" max="24" step="any" defaultValue={entry?.value} required />
            ) : (
              <input className={inputClass} name="value" defaultValue={entry?.value} maxLength={80} required={fields.required} />
            )}
          </label>
        )}
        <label className="text-sm sm:col-span-2">
          {kind === "visit" ? "Questions or notes (optional)" : "Notes (optional)"}
          <textarea className={inputClass} name="notes" rows={3} maxLength={500} defaultValue={entry?.notes} />
        </label>
      </fieldset>
      {error && <p role="alert" className="mt-4 text-sm text-[#ffd4bf]">{error}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save entry"}</Button>
        <Button variant="ghost" disabled={busy} onClick={() => onClose()}>Cancel</Button>
      </div>
    </form>
  );
}

function EntryList({ title, entries, onEdit, onDelete }: {
  title: string;
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(10);

  return (
    <section className="mt-8" aria-label={title}>
      <h2 className="mb-3 font-display text-2xl">{title}</h2>
      <ul className="grid gap-3">
        {entries.slice(0, visibleCount).map((entry) => (
          <li key={entry.id} className="rounded-2xl border border-white/12 bg-white/[0.055] px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4">
              <div className="min-w-0 pt-1">
                <h3 className="break-words text-base font-medium">{entry.title}</h3>
                <p className="mt-1 text-sm text-foreground/75">
                  <time dateTime={entry.time ? `${entry.date}T${entry.time}` : entry.date}>
                    {displayDate(entry.date)}{entry.time && ` · ${displayTime(entry.time)}`}
                  </time>
                  {entry.source !== "manual" && ` · ${SOURCE_LABELS[entry.source]}`}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" className="px-2 text-sm" aria-label={`Edit ${entry.title}`} onClick={() => onEdit(entry)}>Edit</Button>
                <Button variant="ghost" className="px-2 text-sm" aria-label={`Delete ${entry.title}`} onClick={() => onDelete(entry)}>Delete</Button>
              </div>
            </div>
            {entry.value && <p className="mt-2 break-words">{displayReading(entry)}</p>}
            {entry.notes && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/85">{entry.notes}</p>}
          </li>
        ))}
      </ul>
      {entries.length > visibleCount && (
        <Button variant="quiet" className="mt-4 text-sm" onClick={() => setVisibleCount((count) => count + 10)}>Show more</Button>
      )}
    </section>
  );
}

export default function HealthArea({ area }: { area: AreaId }) {
  const { entries, profile } = useHealth();
  const [form, setForm] = useState<{ kind: EntryKind; entry?: Entry }>();
  const [removing, setRemoving] = useState<Entry>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const actions = useRef<HTMLDivElement>(null);
  const deleteHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (removing) deleteHeading.current?.focus(); }, [removing]);

  const info = AREAS[area];
  const kinds: readonly EntryKind[] = info.kinds;
  const relevant = entries.filter((entry) => kinds.includes(entry.kind)).sort((a, b) => compareEntries(b, a));
  const today = relevant.length ? dateKey() : "";
  const upcoming = relevant.filter((entry) => entry.kind === "visit" && entry.date >= today).reverse();
  const history = relevant.filter((entry) => entry.kind !== "visit" || entry.date < today);

  function closeForm(text = "") {
    setForm(undefined);
    setMessage(text);
    actions.current?.querySelector("button")?.focus();
  }

  async function confirmDelete() {
    if (!removing) return;
    setDeleting(true);
    setError("");
    try {
      await deleteEntry(removing.id);
      if (form?.entry?.id === removing.id) setForm(undefined);
      setRemoving(undefined);
      setMessage("Entry deleted.");
      actions.current?.querySelector("button")?.focus();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Still couldn’t delete this entry.");
    } finally {
      setDeleting(false);
    }
  }

  const listActions = {
    onEdit: (entry: Entry) => { setRemoving(undefined); setMessage(""); setForm({ entry, kind: entry.kind }); },
    onDelete: (entry: Entry) => { setError(""); setMessage(""); setRemoving(entry); },
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-4 sm:px-8 sm:pt-6">
      <Link href="/" className="inline-flex min-h-11 items-center text-sm text-foreground/85 hover:underline">← Today</Link>
      <header className="mt-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-white/8" style={{ color: info.color }}><HealthIcon area={area} /></span>
        <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-6xl">{info.title}</h1>
        <p className="mt-3 text-foreground/80">{info.description}</p>
      </header>

      <div ref={actions} className="mt-6 flex flex-wrap gap-2">
        {kinds.map((kind, i) => <Button key={kind} variant={i === 0 ? "primary" : "quiet"} onClick={() => { setRemoving(undefined); setMessage(""); setForm({ kind }); }}>
          + Add {ENTRY_FIELDS[kind].singular}
        </Button>)}
      </div>
      {form && <EntryForm key={form.entry?.id ?? form.kind} {...form} onClose={closeForm} />}
      <p role="status" className={message ? "mt-3 text-sm text-foreground/80" : "sr-only"}>{message}</p>

      {removing && (
        <section aria-labelledby="delete-entry-title" className="mt-5 rounded-2xl border border-white/15 bg-background/65 p-4">
          <h2 id="delete-entry-title" className="break-words font-medium" tabIndex={-1} ref={deleteHeading}>Delete {removing.title}?</h2>
          {error && <p role="alert" className="mt-2 text-sm text-[#ffd4bf]">{error}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="quiet" className="text-sm" onClick={confirmDelete} disabled={deleting}>Delete entry</Button>
            <Button variant="ghost" className="text-sm" onClick={() => {
              setRemoving(undefined);
              actions.current?.querySelector("button")?.focus();
            }} disabled={deleting}>Cancel</Button>
          </div>
        </section>
      )}

      {area === "care" && profile.monitoring && (
        <section className="mt-7 rounded-2xl border border-white/12 bg-white/[0.055] px-4 py-3 sm:px-5">
          <h2 className="font-display text-xl">What you’re monitoring</h2>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/85">{profile.monitoring}</p>
          <Link href="/setup#context" className="inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline">Edit health context <span aria-hidden="true" className="ml-1">→</span></Link>
        </section>
      )}

      {!relevant.length && (
        <div className="mt-8 rounded-2xl border border-white/12 p-5 text-sm text-foreground/80">
          <p>No entries yet.</p>
          <Link href="/setup#import" className="inline-flex min-h-11 items-center text-foreground underline underline-offset-4">Import records</Link>
        </div>
      )}
      {upcoming.length > 0 && <EntryList title="Upcoming visits" entries={upcoming} {...listActions} />}
      {kinds.map((kind) => {
        const items = history.filter((entry) => entry.kind === kind);
        return items.length > 0 && <EntryList key={kind} title={kind === "visit" ? "Past visits" : ENTRY_FIELDS[kind].plural} entries={items} {...listActions} />;
      })}
    </main>
  );
}
