"use client";

import { useTranslations } from "next-intl";
import { ToolBadge } from "@community/ui";
import { useToolDefinitions } from "@/requests/useTools";

export default function AgentPickerTools() {
  const t = useTranslations("chat.agentPicker");
  const tRoot = useTranslations();
  const { data: tools } = useToolDefinitions();

  if (!tools || tools.length === 0) return null;

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
