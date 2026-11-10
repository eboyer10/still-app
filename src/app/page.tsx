import type { Metadata } from "next";
import Today from "@/components/today/Today";

export const metadata: Metadata = {
  title: "Still",
};

export default function Home() {
  return <Today />;
}
