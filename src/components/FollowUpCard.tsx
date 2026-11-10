"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { FOLLOW_UP_LABELS, setFollowUp, useJourney, type FollowUpStatus } from "@/lib/journey";

const OPTIONS: FollowUpStatus[] = ["did-it", "not-yet", "priorities-changed"];

/** One gentle question about the latest unrevisited intention. Up to three per visit, newest first. */
export default function FollowUpCard() {
  const { moments, ready } = useJourney();
  const [skipped, setSkipped] = useState(false);
  const [answered, setAnswered] = useState(0);

  if (!ready) return null;
  const pending = answered < 3 ? [...moments].reverse().find((m) => m.intention && !m.intention.followUp) : undefined;

  if (answered > 0 && !pending) {
    return (
      <p role="status" className="text-sm text-foreground/85">
        Thank you for looking back.
      </p>
    );
  }
  if (!pending?.intention || skipped) return null;

  return (
    <section aria-labelledby="follow-up-title" className="w-full rounded-3xl border border-white/15 bg-white/[0.06] p-5 text-left">
      <h2 id="follow-up-title" className="text-sm text-foreground/85">
        Last time you chose: <span className="font-display font-bold">{pending.intention.text}</span>
      </h2>
      <p className="mt-1 text-sm text-foreground/85">How did it go?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {OPTIONS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => {
              setFollowUp(pending.id, status);
              setAnswered((n) => n + 1);
            }}
            className={buttonClass("quiet", "text-sm")}
          >
            {FOLLOW_UP_LABELS[status]}
          </button>
        ))}
        <button type="button" onClick={() => setSkipped(true)} className={buttonClass("ghost", "text-sm")}>
          Ask me later
        </button>
      </div>
    </section>
  );
}
