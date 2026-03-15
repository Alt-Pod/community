"use client";

import { useTranslations } from "next-intl";
import { Card, StatusBadge } from "@community/ui";

interface ToolResultCardProps {
  toolName: string;
  output: unknown;
  errorText?: string;
  denied?: boolean;
}

export default function ToolResultCard({
  toolName,
  output,
  errorText,
  denied,
}: ToolResultCardProps) {
  const t = useTranslations("tools");

  if (denied) {
    return (
      <Card variant="default" className="my-2 max-w-[65%]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-text-secondary">
            {toolName}
          </span>
          <StatusBadge variant="rejected" label={t("status.rejected")} />
        </div>
      </Card>
    );
  }

  if (errorText) {
    return (
      <Card variant="error" className="my-2 max-w-[65%]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-text-secondary">
            {toolName}
          </span>
          <StatusBadge variant="error" label={t("status.failed")} />
        </div>
        <p className="text-xs text-error">{errorText}</p>
      </Card>
    );
  }

  return (
    <Card variant="success" className="my-2 max-w-[65%] overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-text-secondary">
          {toolName}
        </span>
        <StatusBadge variant="success" label={t("status.completed")} />
      </div>
      {output != null && (
        <pre className="text-xs text-text-secondary bg-surface-tertiary rounded-sm p-2 overflow-x-auto whitespace-pre-wrap break-words">
          {typeof output === "string" ? output : JSON.stringify(output, null, 2)}
        </pre>
      )}
    </Card>
  );
}
