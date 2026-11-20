"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Button from "@/components/ui/Button";
import HealthIcon from "@/components/health/HealthIcon";
import HealthImport from "@/components/health/HealthImport";
import { AREAS, AREA_IDS, PROFILE_LIMIT, type Profile } from "@/lib/health";
import { saveProfile, useHealth } from "@/lib/healthStore";

const steps = [
  { key: "focus", label: "Focus" },
  { key: "context", label: "Health context" },
  { key: "import", label: "Imports" },
] as const;

type Step = (typeof steps)[number]["key"];

const headings: Record<Step, string> = {
  focus: "What matters to you?",
  context: "Anything you want to keep in mind?",
  import: "Bring your records",
};

function subscribeHash(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

function currentStep(): Step {
  const step = steps.find((item) => "#" + item.key === window.location.hash);
  return step?.key ?? "focus";
}

export default function HealthSetup() {
  const router = useRouter();
  const { profile, setupDone } = useHealth();
  const hashStep = useSyncExternalStore(subscribeHash, currentStep, () => "focus");
  const [draft, setDraft] = useState<Profile>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sectionHeading = useRef<HTMLHeadingElement>(null);
  const focusHeading = useRef(false);
  const step = steps.findIndex((item) => item.key === hashStep);
  const active = steps[step].key;
  const values = draft ?? profile;

  useEffect(() => {
    if (focusHeading.current) sectionHeading.current?.focus();
    focusHeading.current = false;
  }, [active]);

  function go(next: Step) {
    if (active === next) return;
    focusHeading.current = true;
    window.history.replaceState(null, "", "#" + next);
    window.dispatchEvent(new Event("hashchange"));
  }

  async function finish() {
    setBusy(true);
    setError("");
    try {
      await saveProfile({ ...values, conditions: values.conditions.trim(), monitoring: values.monitoring.trim() });
      router.push("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Still couldn’t save your preferences.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-16 pt-4 sm:px-8 sm:pt-6">
      <Link href="/" className="inline-flex min-h-11 items-center text-sm text-foreground/85 hover:underline">← Today</Link>
      <header className="mt-8">
        <h1 className="font-display text-4xl tracking-tight sm:text-6xl">{setupDone ? "Preferences & imports" : "Make Still yours"}</h1>
        <p className="mt-3 text-sm leading-6 text-foreground/80">Every step is optional. What you add here stays in this browser.</p>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Setup steps">
        {steps.map((item) => (
          <button key={item.key} type="button" aria-current={item.key === active ? "step" : undefined} disabled={busy} onClick={() => go(item.key)} className="min-h-11 rounded-full border border-white/15 px-3.5 text-sm text-foreground/85 hover:bg-white/10 aria-[current=step]:border-[#e4ddff]/75 aria-[current=step]:bg-[#e4ddff]/15 aria-[current=step]:text-foreground">
            {item.label}
          </button>
        ))}
      </nav>

      <section className="mt-4 rounded-3xl border border-white/15 bg-white/[0.055] p-5 sm:p-7" aria-labelledby="setup-step-heading">
        <h2 id="setup-step-heading" ref={sectionHeading} tabIndex={-1} className="font-display text-2xl leading-tight sm:text-3xl">{headings[active]}</h2>
        {active === "focus" && (
          <>
            <p className="mt-2 text-sm leading-6 text-foreground/85">Choose which areas you’d like to see first on Today.</p>
            <fieldset className="mt-5 grid gap-2 sm:grid-cols-2" disabled={busy}>
              <legend className="sr-only">Focus areas</legend>
              {AREA_IDS.map((area) => (
                <label key={area} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-white/12 bg-white/[0.04] px-3 hover:bg-white/12 has-checked:border-white/35 has-checked:bg-white/12">
                  <span style={{ color: AREAS[area].color }}><HealthIcon area={area} /></span>
                  <span className="flex-1 text-sm">{AREAS[area].title}</span>
                  <input type="checkbox" className="size-4 shrink-0 accent-foreground" checked={values.focus.includes(area)} onChange={(event) => {
                    const focus = event.target.checked ? [...values.focus, area] : values.focus.filter((item) => item !== area);
                    setDraft({ ...values, focus });
                  }} />
                </label>
              ))}
            </fieldset>
          </>
        )}

        {active === "context" && (
          <fieldset className="mt-5 space-y-4" disabled={busy}>
            <legend className="sr-only">Optional health context</legend>
            <label className="block text-sm">
              Are there any ongoing conditions you’d like to note?
              <textarea value={values.conditions} onChange={(event) => setDraft({ ...values, conditions: event.target.value })} maxLength={PROFILE_LIMIT} rows={2} className="mt-2 block w-full rounded-xl border border-white/20 bg-background/60 px-3 py-2 text-base" />
            </label>
            <label className="block text-sm">
              What are you monitoring right now?
              <textarea value={values.monitoring} onChange={(event) => setDraft({ ...values, monitoring: event.target.value })} maxLength={PROFILE_LIMIT} rows={2} className="mt-2 block w-full rounded-xl border border-white/20 bg-background/60 px-3 py-2 text-base" />
              <span className="mt-2 block text-sm text-foreground/75">This note appears in Care &amp; monitoring.</span>
            </label>
          </fieldset>
        )}

        {active === "import" && (
          <>
            <p className="mt-2 text-sm leading-6 text-foreground/85">Import a copy from a file or add entries by hand anytime.</p>
            <HealthImport />
          </>
        )}
      </section>

      {error && <p role="alert" className="mt-4 text-sm text-[#ffd4bf]">{error}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {step < steps.length - 1 && <Button onClick={() => go(steps[step + 1].key)} disabled={busy}>Continue</Button>}
        <Button variant={active === "import" ? "primary" : "ghost"} onClick={() => void finish()} disabled={busy}>
          {busy ? "Saving…" : active === "import" && !setupDone ? "Done" : "Save & finish"}
        </Button>
      </div>
    </main>
  );
}
