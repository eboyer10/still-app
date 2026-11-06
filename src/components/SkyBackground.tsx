"use client";

import { useSky } from "@/lib/sky";

/**
 * A soft pastel sky behind the page: pink at the top, a bright pool of light in the middle, lavender
 * and periwinkle below. Drifting clouds brighten a little with each breath. Decorative only.
 * On /moment it inherits `--breath` from the guided breath; elsewhere `auto` runs its own loop.
 */
export default function SkyBackground({ auto = false }: { auto?: boolean }) {
  const sky = useSky();
  return (
    <div aria-hidden="true" data-sky={sky} className={`sky-bg ${auto ? "sky-bg-auto" : ""}`.trim()}>
      <div className="sky-cloud sky-cloud-a" />
      <div className="sky-cloud sky-cloud-b" />
      <div className="sky-cloud sky-cloud-c" />
    </div>
  );
}
