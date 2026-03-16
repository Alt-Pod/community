"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, Button } from "@community/ui";
import type {
  PromptMultiSelectInput,
  PromptMultiSelectOutput,
} from "@community/shared";

interface PromptMultiSelectProps {
  input: PromptMultiSelectInput;
  completed: boolean;
  output?: PromptMultiSelectOutput;
  onSubmit?: (output: PromptMultiSelectOutput) => void;
}

export default function PromptMultiSelect({
  input,
  completed,
  output,
  onSubmit,
}: PromptMultiSelectProps) {
  const t = useTranslations("tools.prompt");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const options = input.options ?? [];

  if (completed && output) {
    const selectedLabels = output.selected.map((v) => {
      const opt = options.find((o) => o.value === v);
      return opt?.label ?? v;
    });
    return (
      <Card variant="success" className="max-w-md">
        <p className="text-sm text-text-secondary mb-1">{input.question}</p>
        <ul className="list-disc list-inside text-sm text-text-primary">
          {selectedLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </Card>
    );
  }

  function toggle(value: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  const count = selected.size;
  const minOk = input.min === undefined || count >= input.min;
  const maxOk = input.max === undefined || count <= input.max;
  const canSubmit = count > 0 && minOk && maxOk;

  return (
    <Card className="max-w-md">
      <p className="text-sm font-medium text-text-primary mb-3">
        {input.question}
      </p>
      <div className="space-y-2 mb-4">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-3 p-2.5 rounded-sm border cursor-pointer transition-colors duration-150 ${
              selected.has(option.value)
                ? "border-accent-gold bg-accent-gold-pale/20"
                : "border-border-subtle hover:border-accent-gold-muted"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.has(option.value)}
              onChange={() => toggle(option.value)}
              className="accent-accent-gold"
            />
            <span className="text-sm text-text-primary">{option.label}</span>
          </label>
        ))}
      </div>
      {!minOk && input.min !== undefined && (
        <p className="text-xs text-text-tertiary mb-2">
          {t("multiSelect.minRequired", { min: input.min })}
        </p>
      )}
      {!maxOk && input.max !== undefined && (
        <p className="text-xs text-error-text mb-2">
          {t("multiSelect.maxAllowed", { max: input.max })}
        </p>
      )}
      <Button
        variant="primary"
        size="sm"
        disabled={!canSubmit}
        onClick={() => {
          if (canSubmit && onSubmit) {
            onSubmit({ selected: Array.from(selected) });
          }
        }}
      >
        {t("submit")}
      </Button>
    </Card>
  );
}
