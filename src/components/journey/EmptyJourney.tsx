import Link from "next/link";
import BreathingOrb from "@/components/BreathingOrb";
import { buttonClass } from "@/components/ui/Button";

export default function EmptyJourney() {
  return (
    <div className="flex flex-col items-center py-12 text-center sm:py-20">
      <BreathingOrb auto className="mb-12" />
      <h2 className="font-serif text-3xl font-light tracking-tight sm:text-4xl">
        Your journey begins with a single pause.
      </h2>
      <p className="mt-4 max-w-sm text-base leading-7 text-foreground/70">
        When you take a moment, what you choose to keep will gather here, only on this device.
      </p>
      <Link href="/moment" className={buttonClass("primary", "mt-10 px-8")}>
        Begin a moment
      </Link>
    </div>
  );
}
