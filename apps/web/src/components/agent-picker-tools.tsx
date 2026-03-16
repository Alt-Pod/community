"use client";

import { useTranslations } from "next-intl";
import { ToolBadge } from "@community/ui";
import { useToolDefinitions, useAgentTools } from "@/requests/useTools";

interface AgentPickerToolsProps {
  agentId?: string;
}

export default function AgentPickerTools({ agentId }: AgentPickerToolsProps) {
  const t = useTranslations("chat.agentPicker");
  const tRoot = useTranslations();
  const { data: allTools } = useToolDefinitions();
  const { data: agentToolIds } = useAgentTools(agentId ?? null);

  if (!allTools || allTools.length === 0) return null;

  const tools = agentId && agentToolIds
    ? allTools.filter((tool) => agentToolIds.includes(tool.id))
    : allTools;

  if (tools.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border-subtle pt-3">
      <p className="text-xs text-text-tertiary mb-2">{t("availableTools")}</p>
      <div className="flex flex-wrap gap-1.5">
        {tools.map((tool) => (
          <ToolBadge
            key={tool.id}
            name={tRoot(tool.name)}
            description={tool.description}
          />
        ))}
      </div>
    </div>
  );
}
