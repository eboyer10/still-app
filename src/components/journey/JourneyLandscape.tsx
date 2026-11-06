import type { Moment } from "@/lib/journey";

/** Most recent moments shown as lights; older ones stay in the timeline below. */
const MAX_LIGHTS = 36;

// Ridge heights in % of the box (viewBox is 100x100, stretched to fit).
const far = (x: number) => 40 + 9 * Math.sin(x * 0.06 + 2.4) + 5 * Math.sin(x * 0.17 + 0.3);
const mid = (x: number) => 60 + 7 * Math.sin(x * 0.09 + 0.6) + 4 * Math.sin(x * 0.23 + 2.1);
const near = (x: number) => 82 + 5 * Math.sin(x * 0.08 + 4.1) + 3 * Math.sin(x * 0.21 + 1);

function ridgePath(height: (x: number) => number) {
  let d = `M0 100 L0 ${height(0).toFixed(2)}`;
  for (let x = 2; x <= 100; x += 2) d += ` L${x} ${height(x).toFixed(2)}`;
  return `${d} L100 100 Z`;
}

const dayFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
const longFormat = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });

function describe(moment: Moment) {
  const date = longFormat.format(new Date(moment.completedAt));
  const kept = [moment.reflection && "a reflection", moment.intention && "an intention"].filter(Boolean);
  return kept.length ? `${date}, with ${kept.join(" and ")}` : date;
}

/**
 * A gentle landscape: every moment is one light resting on the ridge, oldest on the left.
 * Lights are spaced evenly, not by date, so gaps between visits are never shown or judged.
 * Nothing here counts, scores, or measures progress.
 */
export default function JourneyLandscape({ moments }: { moments: Moment[] }) {
  const shown = moments.slice(0, MAX_LIGHTS).reverse();
  const n = shown.length;

  return (
    <figure>
      <div
        className="relative h-44 overflow-hidden rounded-3xl border border-white/60 sm:h-60"
        style={{ background: "var(--sky)" }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <path d={ridgePath(far)} style={{ fill: "var(--ridge-far)" }} />
          <path d={ridgePath(mid)} style={{ fill: "var(--ridge-mid)" }} />
          <path d={ridgePath(near)} style={{ fill: "var(--ridge-near)" }} />
        </svg>

        <ol className="absolute inset-0 m-0 list-none p-0" aria-label="Your moments, oldest to newest">
          {shown.map((moment, i) => {
            const x = n === 1 ? 50 : 8 + (84 * i) / (n - 1);
            const y = mid(x) - 3;
            return (
              <li key={moment.id} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                <a
                  href={`#moment-${moment.id}`}
                  aria-label={describe(moment)}
                  className="group relative grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                >
                  <span
                    className="landscape-light relative block size-3 rounded-full bg-[var(--orb-core)] shadow-[0_0_14px_4px_var(--orb-glow)]"
                    style={{ animationDelay: `${(i % 7) * 0.8}s` }}
                  >
                    {moment.reflection && (
                      <span className="absolute -inset-1.5 rounded-full border border-[var(--orb-core)]/70" />
                    )}
                    {moment.intention && (
                      <span className="absolute -top-3 left-1/2 size-1.5 -translate-x-1/2 rotate-45 bg-[var(--orb-core)]" />
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-5 whitespace-nowrap rounded-full bg-background/85 px-3 py-1 text-xs text-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {dayFormat.format(new Date(moment.completedAt))}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
      <figcaption className="mt-3 text-sm leading-6 text-foreground/80">
        Each light is a moment you took. A ring means you kept a reflection; a small star means you chose an
        intention.
        {moments.length > MAX_LIGHTS && ` Showing your latest ${MAX_LIGHTS}.`}
      </figcaption>
    </figure>
  );
}
