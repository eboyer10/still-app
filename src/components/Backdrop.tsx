"use client";

import type { CSSProperties } from "react";
import { useShape } from "@/lib/arrival";

/**
 * Near-black night with a soft aura in the colour of the chosen feeling. It brightens a little with each
 * breath (`--breath`, inherited from the page, or its own loop with `auto`). Decorative only.
 */
export default function Backdrop({ auto = false }: { auto?: boolean }) {
  const { hue } = useShape();
  return (
    <div
      aria-hidden="true"
      className={`backdrop ${auto ? "backdrop-auto" : ""}`.trim()}
      style={{ "--hue": hue } as CSSProperties}
    />
  );
}
