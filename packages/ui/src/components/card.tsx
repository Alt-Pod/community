import type { ReactNode } from "react";

interface CardProps {
  variant?: "default" | "warning" | "success" | "error";
  className?: string;
  children: ReactNode;
}

const variantClasses: Record<string, string> = {
  default: "border-border-subtle bg-surface-primary",
  warning: "border-accent-gold-muted bg-accent-gold-pale/30",
  success: "border-accent-gold bg-accent-gold-pale/20",
  error: "border-error-border bg-error-bg",
};

export function Card({
  variant = "default",
  className = "",
  children,
}: CardProps) {
  return (
    <div
      className={`rounded-md border p-4 shadow-card ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
