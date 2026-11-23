"use client";

import { useMemo, type CSSProperties } from "react";
import { useArrivalMood } from "@/lib/arrival";
import { NEUTRAL_HUE } from "@/lib/moods";
import { getOrbOutline, orbClipPaths } from "@/lib/orbOutline";

type Size = "hero" | "compact" | "immersive";

const RIPPLE_OPACITY = [0.41, 0.28, 0.19, 0.12, 0.07];

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
  const shape = useMemo(() => orbClipPaths(getOrbOutline(mood)), [mood]);

  return (
    <div
      aria-hidden="true"
      className={`bv bv-${size}${auto ? " bv-auto" : ""} ${className}`.trim()}
      style={{
        "--hue": NEUTRAL_HUE + tint * 0.65,
        "--orb-body": shape.body,
        "--orb-rim": shape.rim,
      } as CSSProperties}
    >
      <div className="bv-halo" />
      <div className="bv-form">
        {RIPPLE_OPACITY.map((opacity, index) => (
          <div
            key={opacity}
            className="bv-shape"
            style={{ "--ripple-index": index, "--ripple-opacity": opacity } as CSSProperties}
          />
        ))}
        <div className="bv-orb">
          <div className="bv-depth"><div className="bv-core" /></div>
        </div>
      </div>
    </div>
  );
}
