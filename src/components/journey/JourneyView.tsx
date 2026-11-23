"use client";

import Link from "next/link";
import EmptyJourney from "@/components/journey/EmptyJourney";
import DeleteConfirm from "@/components/journey/DeleteConfirm";
import MomentEntry from "@/components/journey/MomentEntry";
import { buttonClass } from "@/components/ui/Button";
import LineFromBefore from "@/components/journey/LineFromBefore";
import { useState } from "react";
import { clearJourney, useJourney, type Moment } from "@/lib/journey";

const monthFormat = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });

function groupByMonth(moments: Moment[]) {
  const groups: { label: string; moments: Moment[] }[] = [];
  for (const moment of moments) {
    const label = monthFormat.format(new Date(moment.completedAt));
    const last = groups[groups.length - 1];
    if (last?.label === label) last.moments.push(moment);
    else groups.push({ label, moments: [moment] });
  }
  return groups;
}

type Filter = "all" | "reflections" | "intentions";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "reflections", label: "Reflections" },
  { value: "intentions", label: "Intentions" },
];

export default function JourneyView() {
  const { moments, ready } = useJourney();
  const [filter, setFilter] = useState<Filter>("all");
  const shown = moments.filter((m) =>
    filter === "reflections" ? m.reflection : filter === "intentions" ? m.intention : true,
  );

  return (
    <main className="relative min-h-dvh">
      <div className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-16 pt-4 sm:px-6 sm:pt-6">
        <Link href="/" className="inline-flex min-h-11 items-center text-sm text-foreground/85 hover:underline">← Today</Link>
        <header className="mt-8">
          <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">Your journey</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-foreground/85">
            A quiet record of the times you stopped, what you noticed, and what you hoped to do next.
          </p>
        </header>

        {!ready ? null : moments.length === 0 ? (
          <EmptyJourney />
        ) : (
          <>
            {moments.some((moment) => moment.reflection) && (
              <div className="mt-8"><LineFromBefore moments={moments} /></div>
            )}

            <h2 className="mt-9 font-display text-2xl sm:text-3xl">Saved moments</h2>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
                {FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={filter === option.value}
                    onClick={() => setFilter(option.value)}
                    className={`min-h-11 rounded-full px-5 text-sm transition-colors ${
                      filter === option.value ? "bg-white text-[var(--btn-ink)]" : "bg-white/12 hover:bg-white/20"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Link href="/moment" className={buttonClass("primary", "px-6")}>
                Begin a moment
              </Link>
            </div>

            <div className="mt-8 space-y-10">
              {shown.length === 0 && (
                <p className="text-base text-foreground/85" role="status">
                  Nothing here yet. Moments with {filter === "reflections" ? "a reflection" : "an intention"} will appear here.
                </p>
              )}
              {groupByMonth(shown).map((group) => (
                <section key={group.label} aria-label={group.label}>
                  <h3 className="mb-4 text-sm font-medium text-foreground/85">{group.label}</h3>
                  <ol className="ml-1.5 space-y-4 border-l border-[#b7c8ff]/25 pl-4 sm:pl-6">
                    {group.moments.map((moment) => (
                      <li key={moment.id} className="relative">
                        <span aria-hidden="true" className="absolute -left-[21px] top-7 size-2.5 rounded-full border border-[#d2dbff]/55 bg-[#566895] sm:-left-[29px]" />
                        <MomentEntry moment={moment} />
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>

            <footer className="mt-20 border-t border-foreground/10 pt-6">
              <p className="text-sm leading-6 text-foreground/85">
                Everything here is saved only in this browser. You can edit or remove any of it, or all of it.
              </p>
              <div className="mt-2">
                <DeleteConfirm label="Delete all my journey data" what="all of your journey data" onConfirm={clearJourney} />
              </div>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
