import type { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function TextInput({ className = "", ...props }: TextInputProps) {
  return (
    <input
      className={`w-full rounded-sm bg-surface-tertiary border border-border-subtle px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-gold focus:shadow-gold-glow transition-colors duration-150 ${className}`}
      {...props}
    />
  );
}
