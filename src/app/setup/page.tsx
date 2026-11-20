import type { Metadata } from "next";
import HealthSetup from "@/components/health/HealthSetup";

export const metadata: Metadata = { title: "Health setup · Still" };

export default function SetupPage() {
  return <HealthSetup />;
}
