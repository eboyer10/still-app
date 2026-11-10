"use client";

import { useEffect, useState } from "react";
import DeleteConfirm from "@/components/journey/DeleteConfirm";
import FollowUpPicker from "@/components/journey/FollowUpPicker";
import MomentShape from "@/components/journey/MomentShape";
import { getMood } from "@/lib/moods";
import Button from "@/components/ui/Button";
import { saveReflectionImage } from "@/lib/shareImage";
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

const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
const longFormat = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

const fieldClass =
  "w-full rounded-2xl border border-foreground/25 bg-white/15 px-4 py-3 text-base leading-7 placeholder:text-foreground/60";

export default function MomentEntry({ moment }: { moment: Moment }) {
  const anchor = `#moment-${moment.id}`;
  const [open, setOpen] = useState(() => typeof window !== "undefined" && window.location.hash === anchor);
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState<Editing>(null);
  const [draft, setDraft] = useState("");

  // Lights on the landscape link here: open the card they point to.
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === anchor) setOpen(true);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [anchor]);

  const when = new Date(moment.completedAt);
  const { reflection, intention } = moment;
  const status = intention?.followUp?.status;
  const bodyId = `body-${moment.id}`;

  const startEditing = (field: Exclude<Editing, null>, current: string) => {
    setDraft(current);
    setEditing(field);
    setMenu(false);
    setOpen(true);
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

  const preview = reflection?.text ?? intention?.text ?? "A pause, kept quietly.";

  return (
    <article
      id={`moment-${moment.id}`}
      tabIndex={-1}
      aria-label={`Moment on ${longFormat.format(when)}`}
      className="rise-in scroll-mt-24 rounded-3xl bg-white/12 outline-none backdrop-blur"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 rounded-3xl px-4 py-4 text-left sm:px-5"
      >
        <MomentShape moment={moment} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-foreground/80">
            {dateFormat.format(when)} · {timeFormat.format(when)}
            {moment.mood && getMood(moment.mood) ? ` · ${getMood(moment.mood)?.label}` : ""}
          </span>
          <span className={`mt-0.5 block font-display text-lg leading-snug ${open ? "" : "line-clamp-2"}`}>{preview}</span>
          {!open && (reflection || intention) && (
            <span className="mt-2 flex flex-wrap gap-2 text-xs text-foreground/85">
              {reflection && <span className="rounded-full bg-white/15 px-2.5 py-1">Reflection</span>}
              {intention && (
                <span className="rounded-full bg-white/15 px-2.5 py-1">
                  Intention{status ? ` · ${FOLLOW_UP_LABELS[status]}` : ""}
                </span>
              )}
            </span>
          )}
        </span>
        <span aria-hidden="true" className={`text-xl text-foreground/70 transition-transform ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>

      {open && (
        <div id={bodyId} className="space-y-6 px-4 pb-5 sm:px-5">
          {reflection && (
            <section aria-label="Reflection">
              <p className="text-xs uppercase tracking-widest text-foreground/80">Reflection</p>
              {editing === "reflection" ? (
                editor("reflection")
              ) : (
                <>
                  <blockquote className="mt-2 whitespace-pre-wrap font-display text-xl leading-8 sm:text-2xl sm:leading-9">
                    {reflection.text}
                  </blockquote>
                  {reflection.editedAt && <p className="mt-1 text-xs text-foreground/70">Edited</p>}
                </>
              )}
            </section>
          )}

          {intention && (
            <section aria-label="Intention">
              <p className="text-xs uppercase tracking-widest text-foreground/80">Intention</p>
              {editing === "intention" ? (
                editor("intention")
              ) : (
                <>
                  <p className="mt-2 text-base leading-7">{intention.text}</p>
                  <FollowUpPicker
                    momentId={moment.id}
                    value={status}
                    onChange={(next) => setFollowUp(moment.id, next)}
                  />
                </>
              )}
            </section>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-foreground/10 pt-3">
            <Button
              variant="ghost"
              className="px-4 text-sm"
              aria-expanded={menu}
              aria-haspopup="true"
              onClick={() => setMenu((v) => !v)}
            >
              {menu ? "Close options" : "Options"}
            </Button>
          </div>
          {menu && (
            <div role="group" aria-label="Options for this moment" className="flex flex-wrap items-center gap-2">
              {reflection && (
                <>
                  <Button variant="ghost" className="px-4 text-sm" onClick={() => startEditing("reflection", reflection.text)}>
                    Edit reflection
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-4 text-sm"
                    onClick={() => void saveReflectionImage(reflection.text, longFormat.format(when))}
                  >
                    Save as image
                  </Button>
                  <DeleteConfirm label="Remove reflection" what="this reflection" onConfirm={() => removeReflection(moment.id)} />
                </>
              )}
              {intention && (
                <>
                  <Button variant="ghost" className="px-4 text-sm" onClick={() => startEditing("intention", intention.text)}>
                    Edit intention
                  </Button>
                  <DeleteConfirm label="Remove intention" what="this intention" onConfirm={() => removeIntention(moment.id)} />
                </>
              )}
              <DeleteConfirm label="Remove moment" what="this moment and everything saved with it" onConfirm={() => removeMoment(moment.id)} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}
