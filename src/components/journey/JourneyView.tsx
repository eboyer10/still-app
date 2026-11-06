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

export default function JourneyView() {
  const { moments, ready } = useJourney();

  return (
    <div className="relative min-h-dvh">
      <SkyBackground auto />
      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-24 pt-4 sm:pt-6">
        <nav aria-label="Primary" className="flex items-center justify-between">
          <SiteMark />
          <Link href="/settings" className={buttonClass("ghost", "text-sm")}>
            Settings
          </Link>
        </nav>

        <header className="mt-10 sm:mt-16">
          <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-7xl">My journey</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-foreground/85">
            A quiet record of the times you stopped, what you noticed, and what you hoped to do next.
          </p>
        </header>

        {!ready ? null : moments.length === 0 ? (
          <EmptyJourney />
        ) : (
          <>
            <section className="mt-10 sm:mt-14" aria-label="Your journey as a landscape">
              <JourneyLandscape moments={moments} />
            </section>

            <section className="mt-12 sm:mt-16" aria-label="Summary">
              <JourneySummary counts={getJourneyCounts(moments)} />
              <Link href="/moment" className={buttonClass("primary", "mt-8 px-8")}>
                Begin a moment
              </Link>
            </section>

            <div className="mt-16 space-y-14 sm:mt-24">
              {groupByMonth(moments).map((group) => (
                <section key={group.label} aria-label={group.label}>
                  <h2 className="mb-8 text-sm uppercase tracking-widest text-foreground/70">{group.label}</h2>
                  <div className="space-y-12 border-l border-foreground/15">
                    {group.moments.map((moment) => (
                      <MomentEntry key={moment.id} moment={moment} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <footer className="mt-20 border-t border-foreground/10 pt-6">
              <p className="text-sm leading-6 text-foreground/75">
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
