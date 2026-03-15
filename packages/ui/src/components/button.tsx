import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-accent-gold text-text-inverse hover:bg-accent-gold-light focus:shadow-gold-glow disabled:opacity-40 disabled:cursor-not-allowed",
  secondary:
    "bg-surface-primary border border-accent-gold-muted text-accent-gold hover:bg-accent-gold-pale focus:shadow-gold-glow",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-tertiary hover:text-text-primary",
  danger:
    "bg-transparent text-text-secondary hover:text-error hover:bg-error-bg",
};

const sizeClasses: Record<string, string> = {
  sm: "px-2.5 py-1 text-xs rounded-sm",
  md: "px-4 py-2.5 text-sm font-medium rounded-md",
  lg: "px-6 py-3 text-base font-medium rounded-md",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center transition-colors duration-150 focus:outline-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
