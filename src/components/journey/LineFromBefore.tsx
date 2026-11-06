"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { Moment } from "@/lib/journey";
import MomentGlyph from "@/components/journey/MomentGlyph";

const dateFormat = new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric" });

/** One past reflection, brought back gently: a way to read what you wrote without scrolling. */
export default function LineFromBefore({ moments }: { moments: Moment[] }) {
  const withReflection = moments.filter((m) => m.reflection);
  // Start somewhere different each visit; "Show another" steps on from there.
  const [offset, setOffset] = useState(() => Math.floor(Math.random() * 1000));
  if (withReflection.length === 0) return null;

  const moment = withReflection[offset % withReflection.length];

  return (
    <section
      aria-labelledby="line-title"
      className="relative overflow-hidden rounded-3xl bg-white/55 p-6 backdrop-blur sm:p-8"
    >
      <MomentGlyph moment={moment} className="absolute right-4 top-4 size-16 opacity-60" />
      <h2 id="line-title" className="text-xs uppercase tracking-widest text-foreground/80">
        A line from before
      </h2>
      <blockquote className="mt-4 max-w-md whitespace-pre-wrap font-display text-2xl font-medium leading-snug sm:text-3xl">
        {moment.reflection?.text}
      </blockquote>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-foreground/80">{dateFormat.format(new Date(moment.completedAt))}</p>
        {withReflection.length > 1 && (
          <Button variant="ghost" className="text-sm" onClick={() => setOffset((n) => n + 1)}>
            Show another
          </Button>
        )}
      </div>
    </section>
  );
}
