import Link from "next/link";
import BreathingOrb from "@/components/BreathingOrb";
import { buttonClass } from "@/components/ui/Button";

export default function WelcomeScreen() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center sm:px-10 md:py-24">
      <div className="journey-landscape" aria-hidden="true" />
      <BreathingOrb auto className="mb-12 sm:mb-16" />
      <h1 className="font-serif text-6xl font-light tracking-tight sm:text-7xl md:text-8xl">Still</h1>
      <p className="mt-6 max-w-xs text-base leading-7 text-foreground/70 sm:max-w-md sm:text-lg sm:leading-8 md:max-w-lg md:text-xl md:leading-9">
        A quiet moment to pause, reconnect, and take one meaningful step.
      </p>
      <div className="mt-12 flex flex-col items-center gap-2 sm:mt-14">
        <Link href="/moment" className={buttonClass("primary", "px-8")}>
          Begin a moment
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/journey" className={buttonClass("ghost", "text-sm")}>
            My journey
          </Link>
          <Link href="/settings" className={buttonClass("ghost", "text-sm")}>
            Settings
          </Link>
        </div>
      </div>
    </main>
  );
}
