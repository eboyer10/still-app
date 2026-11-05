import type { ReactNode } from "react";

type RadioCardProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description?: ReactNode;
};

/** A native radio styled as a quiet card, so keyboard and screen readers work for free. */
export default function RadioCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
}: RadioCardProps) {
  return (
    <label className="block cursor-pointer">
      <input
        type="radio"
        className="peer sr-only"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <span className="block rounded-2xl border border-foreground/15 px-5 py-4 text-left transition-colors hover:border-foreground/30 peer-checked:border-foreground/75 peer-checked:bg-foreground/5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground">
        <span className="block text-base font-medium">{title}</span>
        {description ? (
          <span className="mt-1 block text-sm leading-6 text-foreground/65">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
