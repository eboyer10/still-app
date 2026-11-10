"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const ITEMS = [
  { href: "/", label: "Today", hint: "Choose a feeling and begin" },
  { href: "/journey", label: "Journey", hint: "What you kept" },
  { href: "/settings", label: "Settings", hint: "Sound, vibration, your data" },
  { href: "/support", label: "Support", hint: "If you need more than a pause" },
];

/** One quiet menu in the top-right corner of every screen. */
export default function MenuButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="menu-root">
      <button
        ref={button}
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="main-menu"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-3 top-3 z-50 grid size-12 place-items-center rounded-full border border-white/15 bg-[#0c1030]/70 backdrop-blur-xl transition-colors hover:bg-white/15 sm:right-5 sm:top-4"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-[#05071c]/60 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            ref={panel}
            id="main-menu"
            role="dialog"
            aria-label="Menu"
            className="fixed right-3 top-[4.5rem] z-50 w-[min(20rem,calc(100vw-1.5rem))] rounded-3xl border border-white/15 bg-[#0c1030]/95 p-2 shadow-2xl backdrop-blur-xl sm:right-5"
          >
            <nav aria-label="Main">
              <ul className="m-0 list-none p-0">
                {ITEMS.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={`block rounded-2xl px-4 py-3 transition-colors hover:bg-white/10 ${active ? "bg-white/15" : ""}`}
                      >
                        <span className="block font-display text-lg font-semibold">{item.label}</span>
                        <span className="block text-sm text-foreground/75">{item.hint}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
