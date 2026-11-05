"use client";

import { useState } from "react";
import DeleteConfirm from "@/components/journey/DeleteConfirm";
import FollowUpPicker from "@/components/journey/FollowUpPicker";
import Button from "@/components/ui/Button";
import {
  FOLLOW_UP_LABELS,
  INTENTION_LIMIT,
  REFLECTION_LIMIT,
  editIntention,
  editReflection,
  removeIntention,
  removeMoment,
  removeReflection,
  setFollowUp,
  type Moment,
} from "@/lib/journey";

type Editing = "reflection" | "intention" | null;

const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

const fieldClass =
  "w-full rounded-2xl border border-foreground/20 bg-transparent px-4 py-3 text-base leading-7 placeholder:text-foreground/60";

export default function MomentEntry({ moment }: { moment: Moment }) {
  const [editing, setEditing] = useState<Editing>(null);
  const [draft, setDraft] = useState("");
  const [revisiting, setRevisiting] = useState(false);

  const when = new Date(moment.completedAt);
  const { reflection, intention } = moment;
  const status = intention?.followUp?.status;

  const startEditing = (field: Exclude<Editing, null>, current: string) => {
    setDraft(current);
    setEditing(field);
  };
  const save = () => {
    if (editing === "reflection") editReflection(moment.id, draft);
    if (editing === "intention") editIntention(moment.id, draft);
    setEditing(null);
  };

  const editor = (field: "reflection" | "intention") => {
    const limit = field === "reflection" ? REFLECTION_LIMIT : INTENTION_LIMIT;
    const label = field === "reflection" ? "Edit your reflection" : "Edit your intention";
    return (
      <form
        className="mt-3 flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <label htmlFor={`${field}-${moment.id}`} className="sr-only">
          {label}
        </label>
        {field === "reflection" ? (
          <textarea
            id={`${field}-${moment.id}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={limit}
            rows={4}
            className={`${fieldClass} resize-none`}
            autoFocus
          />
        ) : (
          <input
            id={`${field}-${moment.id}`}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={limit}
            className={fieldClass}
            autoFocus
          />
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" className="px-5 text-sm" disabled={!draft.trim()}>
            Save
          </Button>
          <Button variant="ghost" className="px-3 text-sm" onClick={() => setEditing(null)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  return (
    <article id={`moment-${moment.id}`} tabIndex={-1} className="rise-in relative scroll-mt-24 pl-6 outline-none sm:pl-8" aria-label={`Moment on ${dateFormat.format(when)}`}>
      <span aria-hidden="true" className="absolute left-0 top-3 size-2.5 rounded-full bg-[linear-gradient(135deg,var(--btn-from),var(--btn-to))] shadow-[0_0_10px_2px_var(--orb-glow)]" />

      <header>
        <time dateTime={moment.completedAt} className="font-display text-2xl tracking-tight sm:text-3xl">
          {dateFormat.format(when)}
        </time>
        <span className="ml-3 text-sm text-foreground/70">{timeFormat.format(when)}</span>
      </header>

      {reflection && (
        <section className="mt-4" aria-label="Reflection">
          <p className="text-xs uppercase tracking-widest text-foreground/70">Reflection</p>
          {editing === "reflection" ? (
            editor("reflection")
          ) : (
            <>
              <blockquote className="mt-2 whitespace-pre-wrap font-display text-xl leading-8 text-foreground/90 sm:text-2xl sm:leading-9">
                {reflection.text}
              </blockquote>
              {reflection.editedAt && <p className="mt-1 text-xs text-foreground/45">Edited</p>}
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <Button variant="ghost" className="min-h-11 px-3 text-sm" onClick={() => startEditing("reflection", reflection.text)}>
                  Edit
                </Button>
                <DeleteConfirm label="Remove" what="this reflection" onConfirm={() => removeReflection(moment.id)} />
              </div>
            </>
          )}
        </section>
      )}

      {intention && (
        <section className="mt-5" aria-label="Intention">
          <p className="text-xs uppercase tracking-widest text-foreground/70">Intention</p>
          {editing === "intention" ? (
            editor("intention")
          ) : (
            <>
              <p className="mt-2 text-base leading-7">{intention.text}</p>
              <p className="mt-1 text-sm text-foreground/75">
                {status ? FOLLOW_UP_LABELS[status] : "Not revisited yet"}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <Button
                  variant="ghost"
                  className="min-h-11 px-3 text-sm"
                  aria-expanded={revisiting}
                  onClick={() => setRevisiting((open) => !open)}
                >
                  {status ? "Change" : "Revisit"}
                </Button>
                <Button variant="ghost" className="min-h-11 px-3 text-sm" onClick={() => startEditing("intention", intention.text)}>
                  Edit
                </Button>
                <DeleteConfirm label="Remove" what="this intention" onConfirm={() => removeIntention(moment.id)} />
              </div>
              {revisiting && (
                <FollowUpPicker
                  momentId={moment.id}
                  value={status}
                  onChange={(next) => setFollowUp(moment.id, next)}
                />
              )}
            </>
          )}
        </section>
      )}

      <div className="mt-4 border-t border-foreground/10 pt-1">
        <DeleteConfirm label="Remove this moment" what="this moment and everything saved with it" onConfirm={() => removeMoment(moment.id)} />
      </div>
    </article>
  );
}
