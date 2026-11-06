import type { Metadata } from "next";
import { DM_Sans, Fraunces, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Still",
  description: "A quiet space for mindfulness and reflection.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
