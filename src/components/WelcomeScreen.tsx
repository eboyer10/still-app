import Link from "next/link";
import WaveBackground from "@/components/WaveBackground";
import BreathingOrb from "@/components/BreathingOrb";
import HomeExtras from "@/components/HomeExtras";
import { buttonClass } from "@/components/ui/Button";

export default function WelcomeScreen() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center [text-shadow:0_1px_16px_rgb(9_7_40/0.8)] sm:px-10 md:py-24">
      <WaveBackground auto />
      <BreathingOrb auto compact className="mb-8 sm:mb-10" />
      <h1 className="font-display text-7xl font-extrabold tracking-tight sm:text-8xl">Still</h1>
      <p className="mt-5 max-w-xs text-base leading-7 text-foreground/85 sm:max-w-md sm:text-lg sm:leading-8 md:max-w-lg md:text-xl md:leading-9">
        A quiet moment to pause, reconnect, and take one meaningful step.
      </p>
      <div className="mt-10 flex flex-col items-center gap-2">
        <Link href="/moment" className={buttonClass("primary", "px-8")}>
          Begin a moment
        </Link>
        <HomeExtras />
      </div>
      <Link
        href="/settings"
        className={buttonClass("ghost", "absolute bottom-3 right-4 text-sm sm:right-8")}
      >
        Settings
      </Link>
    </main>
  );
}
