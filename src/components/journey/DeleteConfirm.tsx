"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type DeleteConfirmProps = {
  /** Visible label on the first button, e.g. "Remove". */
  label: string;
  /** Describes what goes, for screen readers and the confirmation line. */
  what: string;
  onConfirm: () => void;
};

/** Inline two-step delete: no modal, nothing trapped, easy to back out of. */
export default function DeleteConfirm({ label, what, onConfirm }: DeleteConfirmProps) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <Button
        variant="ghost"
        className="min-h-11 px-3 text-sm"
        aria-label={`${label} ${what}`}
        onClick={() => setAsking(true)}
      >
        {label}
      </Button>
    );
  }

  return (
    <span role="group" aria-label={`Confirm: ${label} ${what}`} className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-foreground/85">Remove {what}? This can&apos;t be undone.</span>
      <Button variant="quiet" className="min-h-11 px-4 text-sm" onClick={onConfirm}>
        Yes, remove
      </Button>
      <Button variant="ghost" className="min-h-11 px-3 text-sm" onClick={() => setAsking(false)} autoFocus>
        Keep it
      </Button>
    </span>
  );
}
