"use client";

import { useSyncExternalStore } from "react";
import Dashboard from "@/components/health/Dashboard";
import SiteMark from "@/components/SiteMark";
import Welcome from "@/components/today/Welcome";
import { useHealth } from "@/lib/healthStore";
import { usePreferences } from "@/lib/preferences";

const subscribe = () => () => {};

export default function HomeExperience() {
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const [{ introSeen }] = usePreferences();
  const { setupDone, entries } = useHealth();

  // The browser decides which view to show once its local preferences are available.
  if (!ready) return <main className="mx-auto w-full max-w-5xl px-5 pt-4 sm:px-8 sm:pt-6"><SiteMark /></main>;
  if (introSeen || setupDone || entries.length) return <Dashboard />;
  return <Welcome />;
}
