import Link from "next/link";
import BreathVisual from "@/components/BreathVisual";
import { buttonClass } from "@/components/ui/Button";

export default function EmptyJourney() {
  return (
    <div className="flex flex-col items-center py-10 text-center sm:py-16">
      <BreathVisual size="compact" auto className="mb-10" />
      <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Your journey begins with a single pause.
      </h2>
      <p className="mt-4 max-w-sm text-base leading-7 text-foreground/85">
        When you take a moment, what you choose to keep will gather here, only on this device.
      </p>
      <Link href="/" className={buttonClass("primary", "mt-10 px-8")}>
        Begin a moment
      </Link>
    </div>
  );
}
