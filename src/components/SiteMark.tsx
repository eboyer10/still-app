import Link from "next/link";

/** The one consistent way back to the beginning: "Still" in the top-left of every screen. */
export default function SiteMark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Still, home"
      className={`inline-flex min-h-11 items-center gap-2 font-serif text-xl tracking-tight ${className}`.trim()}
    >
      <span aria-hidden="true" className="size-2.5 rounded-full bg-[var(--orb-mid)]" />
      Still
    </Link>
  );
}
