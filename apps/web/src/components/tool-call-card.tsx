"use client";

import { useTranslations } from "next-intl";
import { Card, StatusBadge } from "@community/ui";
import ToolArgsDisplay from "./tool-args-display";

interface ToolCallCardProps {
  toolName: string;
  args?: Record<string, unknown>;
  state: string;
}

export default function ToolCallCard({ toolName, args, state }: ToolCallCardProps) {
  const t = useTranslations("tools");

  const variant =
    state === "input-streaming" || state === "input-available" || state === "approval-responded"
      ? "running"
      : "pending";

  const label =
    state === "input-streaming" || state === "input-available" || state === "approval-responded"
      ? t("status.executing")
      : t("status.pending");

  return (
    <Card variant="default" className="my-2 max-w-[65%]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-text-secondary">
          {toolName}
        </span>
        <StatusBadge variant={variant} label={label} />
      </div>
      {args && Object.keys(args).length > 0 && <ToolArgsDisplay args={args} />}
    </Card>
  );
}
