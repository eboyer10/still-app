"use client";

import Link from "next/link";
import EmptyJourney from "@/components/journey/EmptyJourney";
import DeleteConfirm from "@/components/journey/DeleteConfirm";
import JourneyLandscape from "@/components/journey/JourneyLandscape";
import JourneySummary from "@/components/journey/JourneySummary";
import MomentEntry from "@/components/journey/MomentEntry";
import SkyBackground from "@/components/SkyBackground";
import SiteMark from "@/components/SiteMark";
import { buttonClass } from "@/components/ui/Button";
import LineFromBefore from "@/components/journey/LineFromBefore";
import { useState } from "react";
import { clearJourney, getJourneyCounts, useJourney, type Moment } from "@/lib/journey";

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
    <div className="relative min-h-dvh">
      <SkyBackground auto />
      <div className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-24 pt-4 sm:px-6 sm:pt-6">
        <nav aria-label="Primary" className="flex items-center justify-between">
          <SiteMark />
          <Link href="/settings" className={buttonClass("ghost", "text-sm")}>
            Settings
          </Link>
        </nav>

        <header className="mt-8 sm:mt-12">
          <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">My journey</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-foreground/85">
            A quiet record of the times you stopped, what you noticed, and what you hoped to do next.
          </p>
        </header>

        {!ready ? null : moments.length === 0 ? (
          <EmptyJourney />
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <LineFromBefore moments={moments} />
              </div>
              <section aria-label="Summary" className="rounded-3xl bg-white/35 p-4 backdrop-blur [&>ul>li]:flex [&>ul>li]:flex-col [&>ul>li]:justify-center">
                <JourneySummary counts={getJourneyCounts(moments)} />
              </section>
              <section aria-label="Your journey as a landscape" className="rounded-3xl bg-white/35 p-4 backdrop-blur">
                <JourneyLandscape moments={moments} />
              </section>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
                {FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={filter === option.value}
                    onClick={() => setFilter(option.value)}
                    className={`min-h-11 rounded-full px-5 text-sm transition-colors ${
                      filter === option.value ? "bg-foreground text-background" : "bg-white/50 hover:bg-white/75"
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
                  <h2 className="mb-3 text-sm uppercase tracking-widest text-foreground/80">{group.label}</h2>
                  <div className="space-y-3">
                    {group.moments.map((moment) => (
                      <MomentEntry key={moment.id} moment={moment} />
                    ))}
                  </div>
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
    </div>
  );
}
