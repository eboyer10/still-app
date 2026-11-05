import Link from "next/link";
import Button, { buttonClass } from "@/components/ui/Button";

type ReminderPreviewCardProps = {
  onDismiss: () => void;
};

/** In-app preview only: nothing is scheduled and no system notification is sent. */
export default function ReminderPreviewCard({ onDismiss }: ReminderPreviewCardProps) {
  return (
    <section
      aria-label="Reminder preview"
      className="fixed inset-x-4 bottom-4 z-20 mx-auto max-w-md rounded-3xl border border-foreground/15 bg-background/95 p-6 text-left shadow-xl backdrop-blur"
    >
      <p className="text-xs uppercase tracking-widest text-foreground/70">Preview</p>
      <h2 className="mt-2 font-display text-xl font-bold">A moment, if you&apos;d like one.</h2>
      <p className="mt-2 text-sm leading-6 text-foreground/85">
        Thirty seconds to pause and reconnect. No pressure either way.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link href="/moment" className={buttonClass("primary")}>
          Begin a moment
        </Link>
        <Button variant="ghost" onClick={onDismiss}>
          Not now
        </Button>
      </div>
    </section>
  );
}
