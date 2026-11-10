"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const icon = (d: string): ReactNode => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ITEMS = [
  { href: "/", label: "Today", icon: icon("M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v4l2.5 2") },
  { href: "/journey", label: "Journey", icon: icon("M4 19c3-9 6-9 8-4s5 3 8-9") },
  { href: "/settings", label: "Settings", icon: icon("M5 8h14M5 16h14M9 6v4M15 14v4") },
];

/** Three labelled places, always the same, so it is clear where you are and where to go. */
export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="tabbar fixed inset-x-0 bottom-0 z-30 px-4 pb-3 pt-2">
      <ul className="m-0 mx-auto flex max-w-sm list-none items-center justify-around rounded-full border border-white/15 bg-[#0c1030]/90 p-1 backdrop-blur-xl">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 min-w-[5.5rem] flex-col items-center justify-center gap-0.5 rounded-full px-3 text-xs transition-colors ${
                  active ? "bg-white/20 text-foreground" : "text-foreground/75 hover:bg-white/10 hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
