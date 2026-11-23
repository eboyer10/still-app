"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SPOTIFY_SUGGESTIONS } from "@/lib/listening";
import Button from "@/components/ui/Button";

export default function Listening() {
  const [selected, setSelected] = useState<(typeof SPOTIFY_SUGGESTIONS)[number] | null>(null);
  const playerHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (selected) playerHeading.current?.focus();
  }, [selected]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-4 sm:px-8 sm:pt-6">
      <Link href="/" className="inline-flex min-h-11 items-center text-sm text-foreground/85 hover:underline">← Today</Link>
      <header className="mt-8">
        <h1 className="font-display text-4xl tracking-tight sm:text-6xl">Listen</h1>
        <p className="mt-3 max-w-md leading-7 text-foreground/80">Guided meditations, soft music, and nature sounds. Spotify loads when you open a player.</p>
      </header>

      <ul className="mt-7 grid gap-3 md:grid-cols-3">
        {SPOTIFY_SUGGESTIONS.map((suggestion) => {
          const open = selected === suggestion;
          return (
            <li key={suggestion.id} id={suggestion.id} tabIndex={-1} className="flex scroll-mt-8 min-w-0 flex-col rounded-3xl border border-white/12 bg-white/[0.055] p-5">
              <p className="text-sm" style={{ color: suggestion.color }}>{suggestion.category}</p>
              <h2 className="mt-3 font-display text-2xl">{suggestion.title}</h2>
              <p className="mb-5 mt-2 flex-1 text-sm leading-6 text-foreground/80">{suggestion.description}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Button
                  variant="quiet"
                  className="px-4 text-sm"
                  aria-label={`${open ? "Close" : "Show"} player for ${suggestion.title}`}
                  aria-expanded={open}
                  aria-controls={open ? "spotify-player" : undefined}
                  onClick={() => setSelected(open ? null : suggestion)}
                >{open ? "Close player" : "Show player"}</Button>
                <a
                  href={`https://open.spotify.com/${suggestion.path}`}
                  aria-label={`Open ${suggestion.title} in Spotify`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm text-foreground/85 underline underline-offset-4"
                >Open in Spotify</a>
              </div>
            </li>
          );
        })}
      </ul>

      {selected && (
        <section id="spotify-player" aria-labelledby="spotify-player-title" className="mt-7 max-w-xl">
          <h2 id="spotify-player-title" ref={playerHeading} tabIndex={-1} className="mb-3 font-display text-xl">{selected.title} on Spotify</h2>
          <iframe
            key={selected.path}
            title={`Spotify player for ${selected.title}`}
            src={`https://open.spotify.com/embed/${selected.path}`}
            className="block h-[352px] w-full rounded-2xl border-0 bg-white/[0.055]"
            allow="encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="no-referrer"
            allowFullScreen
          />
          <p className="mt-2 text-sm text-foreground/75">
            Playback availability varies. <a href={`https://open.spotify.com/${selected.path}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">Open in Spotify</a>
          </p>
        </section>
      )}
    </main>
  );
}
