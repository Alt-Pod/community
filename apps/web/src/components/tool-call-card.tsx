"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, StatusBadge } from "@community/ui";
import ToolArgsDisplay from "./tool-args-display";
import { getToolDisplayName } from "./tool-display-name";

interface ToolCallCardProps {
  toolName: string;
  args?: Record<string, unknown>;
  state: string;
}

export default function ToolCallCard({ toolName, args, state }: ToolCallCardProps) {
  const t = useTranslations("tools");
  const [expanded, setExpanded] = useState(false);

  const displayName = getToolDisplayName(toolName, t);

  const variant =
    state === "input-streaming" || state === "input-available" || state === "approval-responded"
      ? "running"
      : "pending";

  const label =
    state === "input-streaming" || state === "input-available" || state === "approval-responded"
      ? t("status.executing")
      : t("status.pending");

  const hasArgs = args && Object.keys(args).length > 0;

  return (
    <Card variant="default" className="my-2 max-w-[65%]">
      <button
        type="button"
        className="flex items-center justify-between w-full text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-1.5">
          <svg
            className={`w-3 h-3 text-text-tertiary transition-transform ${expanded ? "rotate-90" : ""}`}
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-medium text-text-secondary">
            {displayName}
          </span>
        </div>
        <StatusBadge variant={variant} label={label} />
      </button>
      {expanded && hasArgs && (
        <div className="mt-2">
          <ToolArgsDisplay args={args} />
        </div>
      )}
    </Card>
  );
}
