import type { Metadata } from "next";
import HomeExperience from "@/components/today/HomeExperience";

export const metadata: Metadata = {
  title: "Still",
};

export default function Home() {
  return <HomeExperience />;
}
