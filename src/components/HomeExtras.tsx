"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { SITUATIONS } from "@/lib/situations";
import { FOLLOW_UP_LABELS, setFollowUp, useJourney, type FollowUpStatus } from "@/lib/journey";

const OPTIONS: FollowUpStatus[] = ["did-it", "not-yet", "priorities-changed"];

/** One gentle question about the latest unrevisited intention, and a way into the journey once there is one. */
export default function HomeExtras() {
  const { moments, ready } = useJourney();
  const [skipped, setSkipped] = useState(false);
  const [answered, setAnswered] = useState(0);

  if (!ready) return null;

  // Up to three look-backs per visit, newest first, so catching up never feels like a chore.
  const pending = answered < 3 ? [...moments].reverse().find((m) => m.intention && !m.intention.followUp) : undefined;

  return (
    <>
      {answered > 0 && !pending ? (
        <p role="status" className="mt-8 text-sm text-foreground/85">
          Thank you for looking back.
        </p>
      ) : (
        pending?.intention &&
        !skipped && (
          <section
            aria-labelledby="follow-up-title"
            className="mt-8 w-full max-w-md rounded-3xl border border-foreground/25 bg-background/60 p-5 text-left backdrop-blur"
          >
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
        )
      )}
      <div role="group" aria-label="Pause for a reason" className="mt-6 flex max-w-md flex-wrap justify-center gap-2">
        {SITUATIONS.map((situation) => (
          <Link
            key={situation.id}
            href={`/moment?for=${situation.id}`}
            className="inline-flex min-h-11 items-center rounded-full bg-white/12 px-4 text-sm hover:bg-white/20"
          >
            {situation.label}
          </Link>
        ))}
      </div>
      {moments.length > 0 && (
        <Link href="/journey" className={buttonClass("ghost", "mt-2 text-sm")}>
          My journey
        </Link>
      )}
    </>
  );
}
