"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import BreathVisual from "@/components/BreathVisual";
import SiteMark from "@/components/SiteMark";
import { buttonClass } from "@/components/ui/Button";
import HealthIcon from "@/components/health/HealthIcon";
import { AREAS, AREA_IDS, compareEntries, dateKey, displayDate, displayReading, type AreaId, type Entry } from "@/lib/health";
import { useHealth } from "@/lib/healthStore";

function subscribeDate(callback: () => void) {
  const timer = window.setInterval(callback, 60_000);
  window.addEventListener("focus", callback);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", callback);
  };
}

function AreaCard({ area, entries, today }: { area: AreaId; entries: Entry[]; today: string }) {
  const info = AREAS[area];
  const kinds: readonly Entry["kind"][] = info.kinds;
  const relevant = entries.filter((entry) => kinds.includes(entry.kind)).sort(compareEntries);
  const upcoming = area === "care" ? relevant.find((entry) => entry.kind === "visit" && entry.date >= today) : undefined;
  const entry = upcoming ?? relevant.at(-1);
  const reading = entry ? displayReading(entry) : "";

  return (
    <Link href={`/health/${area}`} className="group flex min-h-40 min-w-0 flex-col rounded-3xl border border-white/12 bg-white/[0.055] p-4 transition-colors hover:border-white/30 hover:bg-white/10 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="grid size-10 place-items-center rounded-2xl bg-white/8" style={{ color: info.color }}>
          <HealthIcon area={area} />
        </span>
        <span aria-hidden="true" className="text-lg leading-none text-foreground/65 transition-transform group-hover:translate-x-0.5">→</span>
      </div>
      <h3 className="mt-4 font-display text-xl leading-tight sm:text-2xl">{info.title}</h3>
      {entry ? (
        <>
          <p className="mt-2 truncate text-sm text-foreground/90">{reading ? `${entry.title} · ${reading}` : entry.title}</p>
          <p className="mt-1 text-xs text-foreground/70">{upcoming ? "Next visit · " : ""}<time dateTime={entry.date}>{displayDate(entry.date)}</time></p>
        </>
      ) : <p className="mt-2 text-sm text-foreground/75">{info.empty}</p>}
    </Link>
  );
}

export default function Dashboard() {
  const { entries, profile, setupDone } = useHealth();
  const today = useSyncExternalStore(subscribeDate, () => dateKey(), () => "");
  const dateLabel = today && new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(today + "T00:00:00Z"));
  const order = [...new Set([...profile.focus, ...AREA_IDS])];

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-14 pt-4 sm:px-8 sm:pt-6">
      <SiteMark />

      <header className="mb-7 mt-9 sm:mb-9 sm:mt-12">
        <h1 className="font-display text-5xl font-medium tracking-tight sm:text-7xl">Today</h1>
        <p className="mt-2 min-h-6 text-sm text-foreground/75 sm:text-base">
          {dateLabel && <time dateTime={today}>{dateLabel}</time>}
        </p>
      </header>

      <section aria-labelledby="mindfulness-title" className="relative isolate rounded-[2rem] border border-[#d4c7ff]/20 bg-white/[0.035]">
        <div className="relative z-10 px-5 py-8 sm:px-9 sm:py-10">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#dfd2ff]">Mindfulness</p>
          <h2 id="mindfulness-title" className="mt-3 max-w-[13ch] font-display text-3xl leading-tight tracking-tight sm:text-5xl">A moment to breathe</h2>
          <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-foreground/85 sm:max-w-md sm:text-base">Take a guided pause and keep a reflection if you like.</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 sm:mt-6">
            <Link href="/moment" className={buttonClass("primary", "text-sm sm:text-base")}>Take a moment</Link>
            <Link href="/journey" className={buttonClass("ghost", "px-3 text-sm sm:text-base")}>My journey</Link>
          </div>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-2 opacity-40 sm:right-[5%] sm:top-1/2 sm:-translate-y-1/2 sm:opacity-100 lg:right-[10%]">
          <BreathVisual auto size="compact" />
        </div>
      </section>

      <section aria-labelledby="areas-title" className="mt-9 sm:mt-11">
        <h2 id="areas-title" className="mb-4 font-display text-2xl sm:text-3xl">Your health</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {order.map((area) => <AreaCard key={area} area={area} entries={entries} today={today} />)}
        </div>
      </section>

      <section aria-labelledby="listening-title" className="mt-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-3xl border border-[#c4c5ff]/15 bg-[#161c34]/70 p-5 sm:mt-6 sm:px-6">
        <div>
          <h2 id="listening-title" className="font-display text-xl sm:text-2xl">Listen</h2>
          <p className="mt-1 text-sm leading-relaxed text-foreground/75">Guided meditation, soft piano, and nature sounds on Spotify.</p>
        </div>
        <Link href="/listen" className={buttonClass("quiet", "px-5 text-sm")}>Explore listening <span aria-hidden="true" className="ml-2">→</span></Link>
      </section>

      {setupDone ? (
        <Link href="/setup" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-foreground/85 underline-offset-4 hover:underline">
          Preferences & imports <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <section aria-labelledby="setup-title" className="mt-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-4 rounded-3xl border border-white/12 bg-[#171733]/70 p-5 sm:mt-6 sm:px-6">
          <div>
            <h2 id="setup-title" className="font-display text-xl sm:text-2xl">Make Still yours</h2>
            <p className="mt-1 text-sm leading-relaxed text-foreground/75">Choose what to see first, add health context, or import records.</p>
          </div>
          <Link href="/setup" className={buttonClass("quiet", "px-5 text-sm")}>Set up Still <span aria-hidden="true" className="ml-2">→</span></Link>
        </section>
      )}
    </main>
  );
}
