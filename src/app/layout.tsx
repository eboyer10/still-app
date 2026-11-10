import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Backdrop from "@/components/Backdrop";
import TabBar from "@/components/TabBar";

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
  appleWebApp: { capable: true, title: "Still", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#070a1f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><Backdrop auto />
        {children}
        <TabBar />
      </body>
    </html>
  );
}
