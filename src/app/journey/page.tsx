import type { Metadata } from "next";
import JourneyView from "@/components/journey/JourneyView";

export const metadata: Metadata = {
  title: "My journey · Still",
};

export default function JourneyPage() {
  return <JourneyView />;
}
