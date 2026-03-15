"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, TextInput } from "@community/ui";
import type { Agent } from "@community/shared";

interface AgentFormProps {
  initial?: Partial<Agent>;
  onSubmit: (data: {
    name: string;
    description: string;
    system_prompt: string;
  }) => void;
  onCancel: () => void;
  submitLabel: string;
  isPending?: boolean;
  error?: string | null;
}

export default function AgentForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  isPending,
  error,
}: AgentFormProps) {
  const t = useTranslations("agents");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [systemPrompt, setSystemPrompt] = useState(
    initial?.system_prompt ?? ""
  );

  return (
    <div className="space-y-4 p-5 border border-border-subtle rounded-md bg-surface-secondary">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {t("form.name")}
        </label>
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("form.namePlaceholder")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {t("form.description")}
        </label>
        <TextInput
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("form.descriptionPlaceholder")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {t("form.systemPrompt")}
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder={t("form.systemPromptPlaceholder")}
          rows={6}
          className="w-full px-3 py-2 text-sm border border-border-default rounded-md bg-surface-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:shadow-gold-glow resize-y"
        />
      </div>
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={() =>
            onSubmit({ name, description, system_prompt: systemPrompt })
          }
          disabled={!name.trim() || !systemPrompt.trim() || isPending}
        >
          {isPending ? t("form.saving") : submitLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={isPending}>
          {t("form.cancel")}
        </Button>
      </div>
    </div>
  );
}
