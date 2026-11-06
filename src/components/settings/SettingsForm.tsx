"use client";

import Link from "next/link";
import { useState } from "react";
import WaveBackground from "@/components/WaveBackground";
import SiteMark from "@/components/SiteMark";
import ReminderPreviewCard from "@/components/settings/ReminderPreviewCard";
import Button, { buttonClass } from "@/components/ui/Button";
import RadioCard from "@/components/ui/RadioCard";
import { unlockAudio } from "@/lib/sound";
import { usePreferences, type ReminderFrequency } from "@/lib/preferences";

const FREQUENCY_OPTIONS: { value: ReminderFrequency; title: string; description: string }[] = [
  { value: "off", title: "No reminders", description: "I'll come when I'm ready." },
  { value: "daily", title: "Once a day", description: "A single, gentle invitation." },
  { value: "weekdays", title: "Weekdays", description: "Just during the working week." },
  { value: "few-per-week", title: "A few times a week", description: "Now and then." },
];

const fieldClass =
  "min-h-11 rounded-2xl border border-foreground/20 bg-transparent px-4 text-base";

export default function SettingsForm() {
  const [preferences, update] = usePreferences();
  const [previewing, setPreviewing] = useState(false);
  const remindersOff = preferences.reminderFrequency === "off";
  const windowInvalid = preferences.windowEnd <= preferences.windowStart;

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-12 sm:py-20">
      <WaveBackground auto />
      <nav aria-label="Primary" className="-mt-6 flex items-center justify-between sm:-mt-12">
        <SiteMark />
        <Link href="/journey" className={buttonClass("ghost", "text-sm")}>
          My journey
        </Link>
      </nav>
      <h1 className="mt-10 font-display text-4xl font-bold tracking-tight sm:text-5xl">Settings</h1>
      <p className="mt-3 text-base leading-7 text-foreground/85">
        Choose how Still might invite you to pause. Reminders aren&apos;t switched on yet, so Still won&apos;t
        send anything. Your choices are kept on this device for when they are.
      </p>

      <fieldset className="mt-10">
        <legend className="text-lg font-medium">How often?</legend>
        <div className="mt-4 grid gap-3">
          {FREQUENCY_OPTIONS.map((option) => (
            <RadioCard
              key={option.value}
              name="frequency"
              value={option.value}
              checked={preferences.reminderFrequency === option.value}
              onChange={(value) => update({ reminderFrequency: value as ReminderFrequency })}
              title={option.title}
              description={option.description}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-10" disabled={remindersOff}>
        <legend className="text-lg font-medium">Preferred time window</legend>
        <p className="mt-1 text-sm text-foreground/75">
          {remindersOff ? "Choose a frequency to set a window." : "Invitations would stay within this window."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex flex-col gap-1 text-sm text-foreground/85">
            From
            <input
              type="time"
              value={preferences.windowStart}
              onChange={(event) => update({ windowStart: event.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-foreground/85">
            Until
            <input
              type="time"
              value={preferences.windowEnd}
              onChange={(event) => update({ windowEnd: event.target.value })}
              className={fieldClass}
            />
          </label>
        </div>
        {!remindersOff && windowInvalid && (
          <p className="mt-3 text-sm text-foreground/85" role="status">
            The end time is before the start time. Try a later end time.
          </p>
        )}
      </fieldset>

      <fieldset className="mt-10">
        <legend className="text-lg font-medium">Notification preferences</legend>
        <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={preferences.inAppReminders}
            onChange={(event) => update({ inAppReminders: event.target.checked })}
            className="mt-1 size-5 accent-foreground"
          />
          <span>
            <span className="block text-base">Show gentle reminders inside Still</span>
            <span className="block text-sm leading-6 text-foreground/75">
              Reminders appear only while the app is open. Still never asks for system
              notification permission.
            </span>
          </span>
        </label>
      </fieldset>

      <fieldset className="mt-10">
        <legend className="text-lg font-medium">Sound</legend>
        <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={preferences.sound}
            onChange={(event) => {
              unlockAudio();
              update({ sound: event.target.checked });
            }}
            className="mt-1 size-5 accent-foreground"
          />
          <span>
            <span className="block text-base">A soft tone that follows the breath</span>
            <span className="block text-sm leading-6 text-foreground/75">
              Off unless you choose it. Pausing the breath pauses the sound.
            </span>
          </span>
        </label>
      </fieldset>

      <div className="mt-12 border-t border-foreground/10 pt-8">
        <h2 className="text-lg font-medium">See how it feels</h2>
        <p className="mt-1 text-sm leading-6 text-foreground/75">
          This shows a sample reminder card. It doesn&apos;t schedule anything.
        </p>
        <Button variant="quiet" className="mt-4" onClick={() => setPreviewing(true)}>
          Preview reminder
        </Button>
      </div>

      <div className="mt-10 border-t border-foreground/10 pt-8">
        <h2 className="text-lg font-medium">Your data</h2>
        <p className="mt-1 text-sm leading-6 text-foreground/75">
          Reflections and intentions are saved only in this browser. You can edit or delete them in{" "}
          <Link href="/journey" className="underline underline-offset-4">
            My journey
          </Link>
          .
        </p>
      </div>

      {previewing && <ReminderPreviewCard onDismiss={() => setPreviewing(false)} />}
    </div>
  );
}
