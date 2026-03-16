"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, StatusBadge } from "@community/ui";
import { getToolDisplayName } from "./tool-display-name";

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
  const [expanded, setExpanded] = useState(false);

  const displayName = getToolDisplayName(toolName, t);

  const chevron = (
    <svg
      className={`w-3 h-3 text-text-tertiary transition-transform ${expanded ? "rotate-90" : ""}`}
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (denied) {
    return (
      <Card variant="default" className="my-2 max-w-[65%]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-text-secondary">
              {displayName}
            </span>
          </div>
          <StatusBadge variant="rejected" label={t("status.rejected")} />
        </div>
      </Card>
    );
  }

  if (errorText) {
    return (
      <Card variant="error" className="my-2 max-w-[65%]">
        <button
          type="button"
          className="flex items-center justify-between w-full text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-1.5">
            {chevron}
            <span className="text-xs font-medium text-text-secondary">
              {displayName}
            </span>
          </div>
          <StatusBadge variant="error" label={t("status.failed")} />
        </button>
        {expanded && (
          <p className="text-xs text-error mt-2">{errorText}</p>
        )}
      </Card>
    );
  }

  return (
    <Card variant="success" className="my-2 max-w-[65%] overflow-hidden">
      <button
        type="button"
        className="flex items-center justify-between w-full text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-1.5">
          {chevron}
          <span className="text-xs font-medium text-text-secondary">
            {displayName}
          </span>
        </div>
        <StatusBadge variant="success" label={t("status.completed")} />
      </button>
      {expanded && output != null && (
        <pre className="text-xs text-text-secondary bg-surface-tertiary rounded-sm p-2 overflow-x-auto whitespace-pre-wrap break-words mt-2">
          {typeof output === "string" ? output : JSON.stringify(output, null, 2)}
        </pre>
      )}
    </Card>
  );
}
