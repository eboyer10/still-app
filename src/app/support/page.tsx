import type { Metadata } from "next";
import SiteMark from "@/components/SiteMark";
import SkyBackground from "@/components/SkyBackground";

export const metadata: Metadata = {
  title: "Support · Still",
};

const linkClass = "underline underline-offset-4 hover:text-foreground";

export default function SupportPage() {
  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-xl px-6 pb-32 pt-4 sm:pt-6">
      <SkyBackground auto />
      <SiteMark />
      <h1 className="mt-10 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        If you need more than a pause
      </h1>
      <p className="mt-4 text-base leading-7 text-foreground/85">
        Still is a quiet moment, not care or treatment. If you are struggling, in crisis, or thinking about
        hurting yourself, please reach out to someone now. You don&apos;t have to carry it alone.
      </p>
      <ul className="mt-8 space-y-4 text-base leading-7 text-foreground/90">
        <li className="rounded-3xl bg-white/12 p-5 backdrop-blur">
          <strong className="font-display text-lg">In the United States</strong>
          <br />
          Call or text <strong>988</strong> any time, or visit{" "}
          <a className={linkClass} href="https://988lifeline.org" target="_blank" rel="noopener noreferrer">
            988lifeline.org
          </a>
          .
        </li>
        <li className="rounded-3xl bg-white/12 p-5 backdrop-blur">
          <strong className="font-display text-lg">Anywhere else</strong>
          <br />
          <a className={linkClass} href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">
            findahelpline.com
          </a>{" "}
          lists free, confidential helplines by country.
        </li>
        <li className="rounded-3xl bg-white/12 p-5 backdrop-blur">
          <strong className="font-display text-lg">In an emergency</strong>
          <br />
          Call your local emergency number.
        </li>
      </ul>
    </main>
  );
}
