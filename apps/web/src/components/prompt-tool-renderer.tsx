"use client";

import { useTranslations } from "next-intl";
import { Card, StatusBadge } from "@community/ui";
import PromptSelect from "@/components/prompt-select";
import PromptMultiSelect from "@/components/prompt-multi-select";
import PromptTextInput from "@/components/prompt-text-input";
import PromptConfirm from "@/components/prompt-confirm";
import PromptForm from "@/components/prompt-form";

interface PromptToolRendererProps {
  toolName: string;
  input: Record<string, unknown>;
  state: string;
  output?: unknown;
  onSubmit?: (output: unknown) => void;
}

export default function PromptToolRenderer({
  toolName,
  input,
  state,
  output,
  onSubmit,
}: PromptToolRendererProps) {
  const t = useTranslations("tools");
  const completed = state === "output-available";

  if (state === "output-denied") {
    const question = (input as any).question || (input as any).title || toolName;
    return (
      <Card variant="default" className="my-2 max-w-md">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary truncate mr-2">
            {question}
          </span>
          <StatusBadge variant="rejected" label={t("status.rejected")} />
        </div>
      </Card>
    );
  }

  switch (toolName) {
    case "prompt.select":
      return (
        <PromptSelect
          input={input as any}
          completed={completed}
          output={output as any}
          onSubmit={onSubmit as any}
        />
      );
    case "prompt.multi_select":
      return (
        <PromptMultiSelect
          input={input as any}
          completed={completed}
          output={output as any}
          onSubmit={onSubmit as any}
        />
      );
    case "prompt.text_input":
      return (
        <PromptTextInput
          input={input as any}
          completed={completed}
          output={output as any}
          onSubmit={onSubmit as any}
        />
      );
    case "prompt.confirm":
      return (
        <PromptConfirm
          input={input as any}
          completed={completed}
          output={output as any}
          onSubmit={onSubmit as any}
        />
      );
    case "prompt.form":
      return (
        <PromptForm
          input={input as any}
          completed={completed}
          output={output as any}
          onSubmit={onSubmit as any}
        />
      );
    default:
      return null;
  }
}
