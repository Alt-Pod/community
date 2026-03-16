"use client";

import { useTranslations } from "next-intl";
import { Heading } from "@community/ui";
import type { Agent } from "@community/shared";
import AgentPickerTools from "./agent-picker-tools";

interface AgentPickerProps {
  agents: Agent[];
  onSelect: (agentId: string | null) => void;
}

export default function AgentPicker({ agents, onSelect }: AgentPickerProps) {
  const t = useTranslations("chat.agentPicker");

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-col items-center">
        <Heading as="h2" className="text-2xl mb-2">
          {t("title")}
        </Heading>
        <p className="text-text-secondary text-sm mb-8">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 w-full max-w-lg mx-auto">
        <button
          onClick={() => onSelect(null)}
          className="text-left p-5 rounded-md border border-border-subtle bg-surface-secondary hover:border-accent-gold-muted hover:shadow-card transition-all duration-150"
        >
          <span className="font-heading text-lg font-semibold text-text-primary">
            {t("defaultName")}
          </span>
          <p className="text-sm text-text-secondary mt-1">
            {t("defaultDescription")}
          </p>
          <AgentPickerTools />
        </button>

        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onSelect(agent.id)}
            className="text-left p-5 rounded-md border border-border-subtle bg-surface-primary hover:border-accent-gold-muted hover:shadow-card transition-all duration-150"
          >
            <span className="font-heading text-lg font-semibold text-text-primary">
              {agent.name}
            </span>
            {agent.description && (
              <p className="text-sm text-text-secondary mt-1">
                {agent.description}
              </p>
            )}
            <AgentPickerTools agentId={agent.id} />
          </button>
        ))}
      </div>
      </div>
  );
}
