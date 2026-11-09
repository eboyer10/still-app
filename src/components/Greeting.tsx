"use client";

import { useSky, type Sky } from "@/lib/sky";

const GREETING: Record<Sky, string> = {
  dawn: "Good morning",
  day: "Welcome back",
  dusk: "Good evening",
  night: "A quiet night",
};

export default function Greeting() {
  return <p className="text-sm uppercase tracking-widest text-foreground/80">{GREETING[useSky()]}</p>;
}
