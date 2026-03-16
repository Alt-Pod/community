"use client";

import { useTranslations } from "next-intl";
import { Card, Button } from "@community/ui";
import type { PromptConfirmInput, PromptConfirmOutput } from "@community/shared";

interface PromptConfirmProps {
  input: PromptConfirmInput;
  completed: boolean;
  output?: PromptConfirmOutput;
  onSubmit?: (output: PromptConfirmOutput) => void;
}

export default function PromptConfirm({
  input,
  completed,
  output,
  onSubmit,
}: PromptConfirmProps) {
  const t = useTranslations("tools.prompt");

  if (completed && output) {
    return (
      <Card variant="success" className="max-w-md">
        <p className="text-sm text-text-secondary mb-1">{input.question}</p>
        <p className="text-sm font-medium text-text-primary">
          {output.confirmed
            ? input.confirmLabel ?? t("confirm.yes")
            : input.denyLabel ?? t("confirm.no")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="max-w-md">
      <p className="text-sm font-medium text-text-primary mb-4">
        {input.question}
      </p>
      <div className="flex gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSubmit?.({ confirmed: true })}
        >
          {input.confirmLabel ?? t("confirm.yes")}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onSubmit?.({ confirmed: false })}
        >
          {input.denyLabel ?? t("confirm.no")}
        </Button>
      </div>
    </Card>
  );
}
