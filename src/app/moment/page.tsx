import type { Metadata } from "next";
import Mindfulness from "@/components/today/Mindfulness";

export const metadata: Metadata = { title: "Mindfulness · Still" };

export default function MomentPage() {
  return <Mindfulness />;
}
