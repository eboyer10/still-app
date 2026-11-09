import Link from "next/link";
import SkyBackground from "@/components/SkyBackground";
import BreathVisual from "@/components/BreathVisual";
import Greeting from "@/components/Greeting";
import HomeExtras from "@/components/HomeExtras";
import MoodPicker from "@/components/MoodPicker";
import { buttonClass } from "@/components/ui/Button";

const STEPS = [
  ["Arrive", "Say how you are arriving, or skip it."],
  ["Breathe", "Thirty seconds. Follow the shape, or simply rest."],
  ["Keep", "Write a line or choose one small thing to do away from the screen. Both optional."],
];

export default function WelcomeScreen() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center px-6 pb-32 pt-14 text-center sm:pt-20">
      <SkyBackground auto />
      <Greeting />
      <h1 className="mt-2 font-display text-6xl font-semibold tracking-tight sm:text-7xl">Still</h1>
      <p className="mt-3 max-w-sm text-base leading-7 text-foreground/85">
        A quiet moment to pause, reconnect, and take one meaningful step.
      </p>

      <BreathVisual auto compact className="my-8" />

      <Link href="/moment" className={buttonClass("primary", "px-10")}>
        Begin a moment
      </Link>

      <MoodPicker />
      <HomeExtras />

      <section aria-labelledby="how-title" className="mt-12 w-full text-left">
        <h2 id="how-title" className="font-display text-xl font-semibold">
          How Still works
        </h2>
        <ol className="mt-3 list-none space-y-2 p-0">
          {STEPS.map(([title, text]) => (
            <li key={title} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <span className="font-medium">{title}.</span>{" "}
              <span className="text-foreground/85">{text}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm leading-6 text-foreground/80">
          Use the bar at the bottom to move between Home, Pause, Journey and Settings. Nothing leaves this device.
        </p>
      </section>
    </main>
  );
}
