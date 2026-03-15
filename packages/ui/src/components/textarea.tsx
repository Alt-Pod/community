import type { TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ className = "", ...props }: TextAreaProps) {
  return (
    <textarea
      className={`w-full rounded-sm bg-surface-tertiary border border-border-subtle px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-gold focus:shadow-gold-glow transition-colors duration-150 resize-none ${className}`}
      rows={3}
      {...props}
    />
  );
}
