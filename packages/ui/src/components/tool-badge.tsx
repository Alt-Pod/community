interface ToolBadgeProps {
  name: string;
  description?: string;
  active?: boolean;
  onClick?: () => void;
}

export function ToolBadge({ name, description, active, onClick }: ToolBadgeProps) {
  const baseClasses =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors";
  const colorClasses = active
    ? "border-accent-gold-muted bg-accent-gold/10 text-accent-gold"
    : "border-border-subtle bg-surface-primary text-text-primary";
  const interactiveClasses = onClick
    ? "cursor-pointer hover:border-accent-gold-muted hover:text-accent-gold"
    : "";

  const Tag = onClick ? "button" : "span";

  return (
    <Tag
      className={`${baseClasses} ${colorClasses} ${interactiveClasses}`}
      onClick={onClick}
      title={description}
      type={onClick ? "button" : undefined}
    >
      {name}
    </Tag>
  );
}
