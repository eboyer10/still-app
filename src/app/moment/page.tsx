import { redirect } from "next/navigation";

/** Older links land on Today, where the moment now begins. */
export default function MomentPage() {
  redirect("/");
}
