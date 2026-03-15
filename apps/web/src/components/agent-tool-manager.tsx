"use client";

import { useTranslations } from "next-intl";
import { Button } from "@community/ui";
import { useToolDefinitions, useAgentTools, useSetAgentTools } from "@/requests/useTools";

interface AgentToolManagerProps {
  agentId: string;
}

export default function AgentToolManager({ agentId }: AgentToolManagerProps) {
  const t = useTranslations("agents.detail");
  const tRoot = useTranslations();
  const { data: allTools } = useToolDefinitions();
  const { data: assignedToolIds } = useAgentTools(agentId);
  const setToolsMutation = useSetAgentTools();

  const assignedSet = new Set(assignedToolIds ?? []);
  const assignedTools = allTools?.filter((tool) => assignedSet.has(tool.id)) ?? [];
  const availableTools = allTools?.filter((tool) => !assignedSet.has(tool.id)) ?? [];

  function handleAdd(toolId: string) {
    const updated = [...(assignedToolIds ?? []), toolId];
    setToolsMutation.mutate({ agentId, toolIds: updated });
  }

  function handleRemove(toolId: string) {
    const updated = (assignedToolIds ?? []).filter((id) => id !== toolId);
    setToolsMutation.mutate({ agentId, toolIds: updated });
  }

  if (!allTools) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-text-secondary mb-3">
        {t("tools")}
      </h3>

      {/* Assigned tools */}
      <div className="mb-4">
        <p className="text-xs text-text-tertiary mb-2">{t("assignedTools")}</p>
        {assignedTools.length === 0 ? (
          <p className="text-xs text-text-tertiary italic">{t("noToolsAssigned")}</p>
        ) : (
          <div className="space-y-2">
            {assignedTools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between rounded-md border border-accent-gold-muted bg-accent-gold/5 px-3 py-2"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <span className="text-sm font-medium text-text-primary">
                    {tRoot(tool.name)}
                  </span>
                  <p className="text-xs text-text-tertiary mt-0.5 truncate">
                    {tool.description}
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemove(tool.id)}
                  disabled={setToolsMutation.isPending}
                >
                  {t("removeTool")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available tools to add */}
      {availableTools.length > 0 && (
        <div>
          <p className="text-xs text-text-tertiary mb-2">{t("availableTools")}</p>
          <div className="space-y-2">
            {availableTools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-secondary px-3 py-2"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <span className="text-sm font-medium text-text-primary">
                    {tRoot(tool.name)}
                  </span>
                  <p className="text-xs text-text-tertiary mt-0.5 truncate">
                    {tool.description}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAdd(tool.id)}
                  disabled={setToolsMutation.isPending}
                >
                  {t("addTool")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
