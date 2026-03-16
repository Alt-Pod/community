"use client";

import { useTranslations } from "next-intl";
import { Button } from "@community/ui";

interface ToolBulkActionsProps {
  count: number;
  onApproveAll: () => void;
  onRejectAll: () => void;
}

export default function ToolBulkActions({
  count,
  onApproveAll,
  onRejectAll,
}: ToolBulkActionsProps) {
  const t = useTranslations("tools");

  return (
    <div className="flex items-center gap-2 my-2 max-w-[65%]">
      <span className="text-xs text-text-secondary">
        {t("confirmation.pendingCount", { count })}
      </span>
      <Button variant="primary" size="sm" onClick={onApproveAll}>
        {t("confirmation.approveAll")}
      </Button>
      <Button variant="danger" size="sm" onClick={onRejectAll}>
        {t("confirmation.rejectAll")}
      </Button>
    </div>
  );
}
