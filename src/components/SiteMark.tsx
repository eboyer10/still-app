import Link from "next/link";

/**
 * The one consistent way back to the beginning: "Still" in the top-left of every screen.
 * Inside the guided flow on the home page, `onNavigate` returns to the first step without a page change.
 */
export default function SiteMark({ className = "", onNavigate }: { className?: string; onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      aria-label="Still, home"
      onClick={
        onNavigate
          ? (event) => {
              event.preventDefault();
              onNavigate();
            }
          : undefined
      }
      className={`inline-flex min-h-11 items-center gap-2 font-display text-2xl tracking-tight ${className}`.trim()}
    >
      <span aria-hidden="true" className="size-3 rounded-full bg-[linear-gradient(135deg,var(--btn-from),var(--btn-to))] ring-2 ring-white/80 shadow-[0_0_10px_2px_var(--orb-glow)]" />
      Still
    </Link>
  );
}
