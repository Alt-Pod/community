"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, Button, TextInput, TextArea, Select } from "@community/ui";
import type { PromptFormInput, PromptFormOutput, FormFieldDef } from "@community/shared";

interface PromptFormProps {
  input: PromptFormInput;
  completed: boolean;
  output?: PromptFormOutput;
  onSubmit?: (output: PromptFormOutput) => void;
}

export default function PromptForm({
  input,
  completed,
  output,
  onSubmit,
}: PromptFormProps) {
  const t = useTranslations("tools.prompt");
  const [values, setValues] = useState<Record<string, string | number>>(() => {
    const initial: Record<string, string | number> = {};
    for (const field of input.fields) {
      if (field.type === "number") {
        initial[field.name] = field.min ?? 0;
      } else if (field.type === "select") {
        initial[field.name] = field.options[0]?.value ?? "";
      } else {
        initial[field.name] = "";
      }
    }
    return initial;
  });

  if (completed && output) {
    return (
      <Card variant="success" className="max-w-md">
        {input.title && (
          <p className="text-sm font-medium text-text-primary mb-2">
            {input.title}
          </p>
        )}
        <dl className="space-y-1">
          {input.fields.map((field) => (
            <div key={field.name} className="flex gap-2 text-sm">
              <dt className="text-text-secondary">{field.label}:</dt>
              <dd className="text-text-primary">
                {field.type === "select"
                  ? field.options.find(
                      (o) => o.value === String(output.values[field.name])
                    )?.label ?? output.values[field.name]
                  : output.values[field.name]}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    );
  }

  function setValue(name: string, value: string | number) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  const allRequiredFilled = input.fields.every((field) => {
    if (!field.required) return true;
    const val = values[field.name];
    if (typeof val === "string") return val.trim() !== "";
    return val !== undefined;
  });

  function renderField(field: FormFieldDef) {
    switch (field.type) {
      case "text":
        return (
          <TextInput
            value={String(values[field.name] ?? "")}
            onChange={(e) => setValue(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case "textarea":
        return (
          <TextArea
            value={String(values[field.name] ?? "")}
            onChange={(e) => setValue(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case "select":
        return (
          <Select
            value={String(values[field.name] ?? "")}
            onChange={(e) => setValue(field.name, e.target.value)}
            options={field.options}
          />
        );
      case "number":
        return (
          <TextInput
            type="number"
            value={String(values[field.name] ?? "")}
            onChange={(e) => setValue(field.name, Number(e.target.value))}
            min={field.min}
            max={field.max}
          />
        );
    }
  }

  return (
    <Card className="max-w-md">
      {input.title && (
        <p className="text-sm font-medium text-text-primary mb-4">
          {input.title}
        </p>
      )}
      <div className="space-y-4 mb-4">
        {input.fields.map((field) => (
          <div key={field.name}>
            <label className="block text-xs text-text-secondary mb-1">
              {field.label}
              {field.required && (
                <span className="text-error-text ml-0.5">*</span>
              )}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>
      <Button
        variant="primary"
        size="sm"
        disabled={!allRequiredFilled}
        onClick={() => {
          if (allRequiredFilled && onSubmit) {
            onSubmit({ values });
          }
        }}
      >
        {t("submit")}
      </Button>
    </Card>
  );
}
