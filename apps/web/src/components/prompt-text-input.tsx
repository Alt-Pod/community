"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, Button, TextInput, TextArea } from "@community/ui";
import type {
  PromptTextInputInput,
  PromptTextInputOutput,
} from "@community/shared";

interface PromptTextInputProps {
  input: PromptTextInputInput;
  completed: boolean;
  output?: PromptTextInputOutput;
  onSubmit?: (output: PromptTextInputOutput) => void;
}

export default function PromptTextInput({
  input,
  completed,
  output,
  onSubmit,
}: PromptTextInputProps) {
  const t = useTranslations("tools.prompt");
  const [text, setText] = useState("");

  if (completed && output) {
    return (
      <Card variant="success" className="max-w-md">
        <p className="text-sm text-text-secondary mb-1">{input.question}</p>
        <p className="text-sm text-text-primary whitespace-pre-wrap">
          {output.text}
        </p>
      </Card>
    );
  }

  const InputComponent = input.multiline ? TextArea : TextInput;

  return (
    <Card className="max-w-md">
      <p className="text-sm font-medium text-text-primary mb-3">
        {input.question}
      </p>
      <div className="mb-4">
        <InputComponent
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={input.placeholder}
        />
      </div>
      <Button
        variant="primary"
        size="sm"
        disabled={!text.trim()}
        onClick={() => {
          if (text.trim() && onSubmit) {
            onSubmit({ text: text.trim() });
          }
        }}
      >
        {t("submit")}
      </Button>
    </Card>
  );
}
