interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="font-heading text-lg italic text-text-tertiary">{message}</p>
    </div>
  );
}
