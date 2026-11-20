import type { Metadata } from "next";
import Welcome from "@/components/today/Welcome";

export const metadata: Metadata = { title: "Welcome · Still" };

export default function WelcomePage() {
  return <Welcome />;
}
