interface LoadingIndicatorProps {
  text?: string;
}

export function LoadingIndicator({ text }: LoadingIndicatorProps) {
  return (
    <div className="flex justify-start">
      <div className="bg-surface-primary shadow-elevated border border-border-subtle rounded-md px-4 py-2.5 text-sm text-text-tertiary">
        <div className="flex items-center gap-3">
          {text && <span>{text}</span>}
          <div className="relative h-0.5 w-16 bg-border-subtle rounded-full overflow-hidden">
            <div
              className="absolute inset-0 bg-accent-gold-muted"
              style={{ animation: "shimmer 2s infinite" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
