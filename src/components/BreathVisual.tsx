"use client";

import type { CSSProperties } from "react";
import { useArrivalMood } from "@/lib/arrival";
import { NEUTRAL_HUE } from "@/lib/moods";

type Size = "hero" | "compact" | "immersive";

export default function BreathVisual({
  size = "hero",
  auto = false,
  className = "",
}: {
  size?: Size;
  auto?: boolean;
  className?: string;
}) {
  const mood = useArrivalMood();
  const tint = (mood?.hue ?? NEUTRAL_HUE) - NEUTRAL_HUE;

  return (
    <div
      aria-hidden="true"
      className={`bv bv-${size}${auto ? " bv-auto" : ""} ${className}`.trim()}
      style={{ "--hue": NEUTRAL_HUE + tint * 0.2 } as CSSProperties}
    >
      <div className="bv-halo" />
      <div className="bv-orb" />
    </div>
  );
}
