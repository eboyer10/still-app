import type { Metadata } from "next";
import Listening from "@/components/today/Listening";

export const metadata: Metadata = { title: "Listen · Still" };

export default function ListenPage() {
  return <Listening />;
}
