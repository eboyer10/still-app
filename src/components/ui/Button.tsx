import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "quiet" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center rounded-full px-6 text-base font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(100deg,var(--btn-from),var(--btn-to))] text-[var(--btn-ink)] shadow-[0_8px_30px_-8px_var(--orb-glow)] hover:brightness-105",
  quiet: "border border-foreground/25 text-foreground hover:bg-foreground/5",
  ghost: "text-foreground/70 underline-offset-4 hover:text-foreground hover:underline",
};

/** Shared by <Button> and link-styled-as-button (next/link). */
export function buttonClass(variant: ButtonVariant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`.trim();
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export default function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}
