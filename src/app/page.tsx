import type { Metadata } from "next";
import MomentFlow from "@/components/moment/MomentFlow";

export const metadata: Metadata = {
  title: "Still",
};

export default function Home() {
  return <MomentFlow />;
}
