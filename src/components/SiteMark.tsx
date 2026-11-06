import Link from "next/link";

/** The one consistent way back to the beginning: "Still" in the top-left of every screen. */
export default function SiteMark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Still, home"
      className={`inline-flex min-h-11 items-center gap-2 font-display text-2xl tracking-tight ${className}`.trim()}
    >
      <span aria-hidden="true" className="size-2.5 rounded-full bg-[linear-gradient(135deg,var(--btn-from),var(--btn-to))] shadow-[0_0_10px_2px_var(--orb-glow)]" />
      Still
    </Link>
  );
}
