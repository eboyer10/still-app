"use client";

import { useSyncExternalStore } from "react";

export type Sky = "dawn" | "day" | "dusk" | "night";

function currentSky(): Sky {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return "dawn";
  if (hour >= 9 && hour < 17) return "day";
  if (hour >= 17 && hour < 21) return "dusk";
  return "night";
}

function subscribe(listener: () => void) {
  const timer = window.setInterval(listener, 10 * 60 * 1000);
  return () => window.clearInterval(timer);
}

/** The sky follows the local hour. It only tints the background; the app stays dark. */
export function useSky(): Sky {
  return useSyncExternalStore(subscribe, currentSky, () => "night");
}
