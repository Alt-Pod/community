interface StatusBadgeProps {
  variant: "pending" | "running" | "success" | "error" | "rejected";
  label: string;
}

const dotClasses: Record<string, string> = {
  pending: "bg-text-tertiary",
  running: "bg-accent-gold animate-pulse",
  success: "bg-accent-gold",
  error: "bg-error",
  rejected: "bg-text-tertiary",
};

const textClasses: Record<string, string> = {
  pending: "text-text-tertiary",
  running: "text-accent-gold",
  success: "text-accent-gold",
  error: "text-error",
  rejected: "text-text-tertiary",
};

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${textClasses[variant]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[variant]}`} />
      {label}
    </span>
  );
}
