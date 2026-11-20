import type { Metadata } from "next";
import Dashboard from "@/components/health/Dashboard";

export const metadata: Metadata = {
  title: "Still",
};

export default function Home() {
  return <Dashboard />;
}
