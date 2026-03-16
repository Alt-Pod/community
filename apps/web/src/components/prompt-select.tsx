"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, Button } from "@community/ui";
import type { PromptSelectInput, PromptSelectOutput } from "@community/shared";

interface PromptSelectProps {
  input: PromptSelectInput;
  completed: boolean;
  output?: PromptSelectOutput;
  onSubmit?: (output: PromptSelectOutput) => void;
}

export default function PromptSelect({
  input,
  completed,
  output,
  onSubmit,
}: PromptSelectProps) {
  const t = useTranslations("tools.prompt");
  const [selected, setSelected] = useState<string | null>(null);

  if (completed && output) {
    const selectedOption = input.options.find(
      (o) => o.value === output.selected
    );
    return (
      <Card variant="success" className="max-w-md">
        <p className="text-sm text-text-secondary mb-1">{input.question}</p>
        <p className="text-sm font-medium text-text-primary">
          {selectedOption?.label ?? output.selected}
        </p>
      </Card>
    );
  }

  return (
    <Card className="max-w-md">
      <p className="text-sm font-medium text-text-primary mb-3">
        {input.question}
      </p>
      <div className="space-y-2 mb-4">
        {input.options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-3 p-2.5 rounded-sm border cursor-pointer transition-colors duration-150 ${
              selected === option.value
                ? "border-accent-gold bg-accent-gold-pale/20"
                : "border-border-subtle hover:border-accent-gold-muted"
            }`}
          >
            <input
              type="radio"
              name="prompt-select"
              value={option.value}
              checked={selected === option.value}
              onChange={() => setSelected(option.value)}
              className="accent-accent-gold"
            />
            <span className="text-sm text-text-primary">{option.label}</span>
          </label>
        ))}
      </div>
      <Button
        variant="primary"
        size="sm"
        disabled={selected === null}
        onClick={() => {
          if (selected !== null && onSubmit) {
            onSubmit({ selected });
          }
        }}
      >
        {t("submit")}
      </Button>
    </Card>
  );
}
