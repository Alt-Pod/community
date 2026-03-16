"use client";

import { useTranslations } from "next-intl";
import { Card, Button, StatusBadge } from "@community/ui";
import ToolArgsDisplay from "./tool-args-display";
import { getToolDisplayName } from "./tool-display-name";

interface ToolConfirmationCardProps {
  toolName: string;
  args: Record<string, unknown>;
  approvalId: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  disabled?: boolean;
}

export default function ToolConfirmationCard({
  toolName,
  args,
  approvalId,
  onApprove,
  onReject,
  disabled,
}: ToolConfirmationCardProps) {
  const t = useTranslations("tools");
  const displayName = getToolDisplayName(toolName, t);

  return (
    <Card variant="warning" className="my-2 max-w-[65%]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-secondary">
          {displayName}
        </span>
        <StatusBadge
          variant="pending"
          label={t("status.awaitingConfirmation")}
        />
      </div>

      <p className="text-xs text-text-secondary mb-3">
        {t("confirmation.description")}
      </p>

      <div className="mb-4">
        <p className="text-xs font-medium text-text-secondary mb-1.5">
          {t("card.parameters")}
        </p>
        <ToolArgsDisplay args={args} />
      </div>

      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={disabled}
          onClick={() => onApprove(approvalId)}
        >
          {t("confirmation.approve")}
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={disabled}
          onClick={() => onReject(approvalId)}
        >
          {t("confirmation.reject")}
        </Button>
      </div>
    </Card>
  );
}
