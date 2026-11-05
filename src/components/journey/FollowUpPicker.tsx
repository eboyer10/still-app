"use client";

import RadioCard from "@/components/ui/RadioCard";
import { FOLLOW_UP_LABELS, type FollowUpStatus } from "@/lib/journey";

type FollowUpPickerProps = {
  momentId: string;
  value: FollowUpStatus | undefined;
  onChange: (status: FollowUpStatus) => void;
};

const OPTIONS: FollowUpStatus[] = ["did-it", "not-yet", "priorities-changed"];

/** Three equal, neutral choices. None is framed as better than another. */
export default function FollowUpPicker({ momentId, value, onChange }: FollowUpPickerProps) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm text-foreground/85">How did this go?</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {OPTIONS.map((status) => (
          <RadioCard
            key={status}
            name={`follow-up-${momentId}`}
            value={status}
            checked={value === status}
            onChange={(next) => onChange(next as FollowUpStatus)}
            title={FOLLOW_UP_LABELS[status]}
          />
        ))}
      </div>
    </fieldset>
  );
}
