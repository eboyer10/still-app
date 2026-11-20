"use client";

import Link from "next/link";
import { useState } from "react";
import SiteMark from "@/components/SiteMark";
import Button from "@/components/ui/Button";
import { clearHealth } from "@/lib/healthStore";
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
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function deleteHealthData() {
    setClearing(true);
    setError("");
    try {
      await clearHealth();
      setConfirmClear(false);
      setStatus("Health data cleared.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Still couldn’t clear health data.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 pb-16 pt-4 sm:px-6 sm:pt-6">
      <SiteMark />
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

      <div className="mt-4 rounded-3xl border border-white/15 bg-white/[0.055] p-5">
        <h3 className="font-display text-xl">Health data</h3>
        <p className="mt-2 text-sm leading-6 text-foreground/85">
          Setup answers, manual entries, and imported records are saved in this browser.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link href="/setup" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Preferences &amp; imports</Link>
          {!confirmClear && <Button variant="ghost" className="px-2 text-sm" onClick={() => {
            setStatus("");
            setConfirmClear(true);
          }}>Clear health data</Button>}
        </div>
        {confirmClear && (
          <div className="mt-3 rounded-xl bg-background/60 p-4">
            <p className="text-sm">Delete your setup answers and all manual and imported health entries from this browser?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="quiet" className="text-sm" disabled={clearing} onClick={() => void deleteHealthData()}>Delete health data</Button>
              <Button variant="ghost" className="text-sm" disabled={clearing} onClick={() => { setConfirmClear(false); setError(""); }}>Cancel</Button>
            </div>
            {error && <p role="alert" className="mt-2 text-sm text-[#ffd4bf]">{error}</p>}
          </div>
        )}
        <p role="status" className={status ? "mt-2 text-sm text-foreground/85" : "sr-only"}>{status}</p>
      </div>

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
