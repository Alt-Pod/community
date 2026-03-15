interface SidebarItemProps {
  title: string;
  active?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

export function SidebarItem({
  title,
  active = false,
  onClick,
  onDelete,
}: SidebarItemProps) {
  return (
    <div
      className={`group flex items-center gap-2 px-5 py-3 cursor-pointer text-sm border-b border-border-subtle/50 transition-colors duration-150 ${
        active
          ? "bg-surface-tertiary text-text-primary border-l-3 border-l-accent-gold"
          : "text-text-secondary hover:bg-surface-tertiary/60 hover:text-text-primary"
      }`}
      onClick={onClick}
    >
      <span className="flex-1 truncate">{title}</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="hidden group-hover:block text-text-tertiary hover:text-error text-xs transition-colors duration-150"
        >
          ✕
        </button>
      )}
    </div>
  );
}
