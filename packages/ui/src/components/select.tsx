import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
}

export function Select({ options, className = "", ...props }: SelectProps) {
  return (
    <select
      className={`rounded-sm bg-surface-tertiary border border-border-subtle px-3 py-1.5 text-sm font-mono text-text-secondary tracking-wide focus:outline-none focus:border-accent-gold focus:shadow-gold-glow transition-colors duration-150 ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
