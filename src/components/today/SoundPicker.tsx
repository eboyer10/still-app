"use client";

import { useId } from "react";
import { isSoundscape, SOUNDS, type Soundscape } from "@/lib/sound";

export default function SoundPicker({ value, onChange, label = "Sound" }: {
  value: Soundscape;
  onChange: (value: Soundscape) => void;
  label?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-foreground/85">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => { if (isSoundscape(event.target.value)) onChange(event.target.value); }}
        className="min-h-11 rounded-xl border border-white/20 bg-[#13172c] py-2 pl-3 pr-2 text-base text-foreground"
      >
        {Object.entries(SOUNDS).map(([id, name]) => <option value={id} key={id}>{name}</option>)}
      </select>
    </div>
  );
}
