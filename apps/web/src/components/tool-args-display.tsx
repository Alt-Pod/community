"use client";

interface ToolArgsDisplayProps {
  args: Record<string, unknown>;
}

export default function ToolArgsDisplay({ args }: ToolArgsDisplayProps) {
  return (
    <div className="space-y-1.5 text-xs">
      {Object.entries(args).map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <span className="font-mono text-text-tertiary min-w-[100px] shrink-0">
            {key}
          </span>
          <span className="text-text-secondary break-all">
            {typeof value === "string"
              ? value.length > 200
                ? value.slice(0, 200) + "..."
                : value
              : JSON.stringify(value)}
          </span>
        </div>
      ))}
    </div>
  );
}
