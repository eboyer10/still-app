"use client";

import Link from "next/link";
import SiteMark from "@/components/SiteMark";
import { buttonClass } from "@/components/ui/Button";
import { unlockAudio } from "@/lib/sound";
import { usePreferences } from "@/lib/preferences";

function Toggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-3xl bg-white/12 p-5 backdrop-blur">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 shrink-0 accent-foreground"
      />
      <span>
        <span className="block text-base font-medium">{title}</span>
        <span className="block text-sm leading-6 text-foreground/85">{description}</span>
      </span>
    </label>
  );
}

export default function SettingsForm() {
  const [preferences, update] = usePreferences();

  return (
    <div className="mx-auto w-full max-w-xl px-5 pb-32 pt-4 sm:px-6 sm:pt-6">
      <nav aria-label="Primary" className="flex items-center justify-between">
        <SiteMark />
        <Link href="/journey" className={buttonClass("ghost", "text-sm")}>
          My journey
        </Link>
      </nav>
      <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Settings</h1>
      <p className="mt-3 text-base leading-7 text-foreground/85">
        Small choices for how a moment feels. Everything stays on this device.
      </p>

      <h2 className="mt-10 text-lg font-medium">During a moment</h2>
      <div className="mt-4 grid gap-3">
        <Toggle
          checked={preferences.sound}
          onChange={(checked) => {
            unlockAudio();
            update({ sound: checked });
          }}
          title="A soft tone that follows the breath"
          description="On by default, and only after you tap Begin. Turn it off here, or mute it during a moment."
        />
        <Toggle
          checked={preferences.haptics}
          onChange={(checked) => {
            if (checked && "vibrate" in navigator) navigator.vibrate(40);
            update({ haptics: checked });
          }}
          title="A gentle vibration with each breath"
          description="On phones that support it. Off unless you choose it."
        />
      </div>

      <h2 className="mt-10 text-lg font-medium">Your data</h2>
      <p className="mt-2 text-sm leading-6 text-foreground/85">
        Reflections and intentions are saved only in this browser, with no account. You can edit or delete them in{" "}
        <Link href="/journey" className="underline underline-offset-4">
          My journey
        </Link>
        .
      </p>

      <h2 className="mt-10 text-lg font-medium">Reminders</h2>
      <p className="mt-2 text-sm leading-6 text-foreground/85">
        Still doesn&apos;t send reminders or notifications, and never asks for permission to. When it does, it will be
        one quiet choice here.
      </p>

      <p className="mt-10 text-sm">
        <Link href="/support" className="underline underline-offset-4">
          Need support beyond a pause?
        </Link>
      </p>
    </div>
  );
}
