import Link from "next/link";
import { SPOTIFY_SUGGESTIONS } from "@/lib/listening";

export default function ListeningSuggestion({ id }: {
  id: "guided-meditation" | "nature-sounds";
}) {
  const suggestion = SPOTIFY_SUGGESTIONS.find((item) => item.id === id);
  if (!suggestion) return null;

  return (
    <aside className="mt-7 w-full rounded-2xl border border-white/12 bg-white/[0.045] px-4 pt-4 text-left sm:px-5">
      <h2 className="font-display text-xl">{suggestion.category}</h2>
      <p className="mt-1 text-sm leading-6 text-foreground/80">{suggestion.description}</p>
      <Link href={`/listen#${suggestion.id}`} className="inline-flex min-h-11 items-center text-sm text-foreground/85 underline underline-offset-4">
        {suggestion.title} on Spotify
      </Link>
    </aside>
  );
}
