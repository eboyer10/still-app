import type { Metadata } from "next";
import MomentFlow from "@/components/moment/MomentFlow";

export const metadata: Metadata = {
  title: "A moment · Still",
};

export default function MomentPage() {
  return <MomentFlow initial="arrive" />;
}
