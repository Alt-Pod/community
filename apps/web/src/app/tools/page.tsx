"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heading, LoadingIndicator } from "@community/ui";
import { useToolDefinitions, useToolAssignments } from "@/requests/useTools";

export default function ToolsPage() {
  const t = useTranslations("toolsPage");
  const tRoot = useTranslations();
  const { data: tools = [], isLoading: toolsLoading } = useToolDefinitions();
  const { data: assignments = [], isLoading: assignmentsLoading } =
    useToolAssignments();

  const isLoading = toolsLoading || assignmentsLoading;

  // Group assignments by tool_id
  const assignmentsByTool = assignments.reduce(
    (acc, a) => {
      (acc[a.tool_id] ??= []).push(a);
      return acc;
    },
    {} as Record<string, typeof assignments>
  );

  // Group tools by category
  const categories = tools.reduce(
    (acc, tool) => {
      (acc[tool.category] ??= []).push(tool);
      return acc;
    },
    {} as Record<string, typeof tools>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <Heading as="h1" className="text-2xl mb-8">
        {t("title")}
      </Heading>

      {isLoading && (
        <LoadingIndicator variant="inline" text={t("loading")} />
      )}

      {Object.entries(categories).map(([category, categoryTools]) => (
        <div key={category} className="mb-8">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4 capitalize">
            {category}
          </h2>
          <div className="space-y-3">
            {categoryTools.map((tool) => {
              const toolAgents = assignmentsByTool[tool.id] ?? [];
              return (
                <div
                  key={tool.id}
                  className="p-5 border border-border-subtle rounded-md bg-surface-primary"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-text-primary">
                      {tRoot(tool.name)}
                    </h3>
                    {tool.requiresConfirmation && (
                      <span className="text-xs px-2 py-0.5 rounded bg-accent-gold-pale text-accent-gold">
                        {t("requiresApproval")}
                      </span>
                    )}
                  </div>
                  {tool.description && (
                    <p className="text-sm text-text-secondary mt-1">
                      {tool.description}
                    </p>
                  )}
                  {toolAgents.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {toolAgents.map((a) => (
                        <Link
                          key={a.agent_id}
                          href={`/agents/${a.agent_id}`}
                          className="text-xs px-2 py-1 rounded bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors"
                        >
                          {a.agent_name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-text-tertiary">
                      {t("noAgents")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {!isLoading && tools.length === 0 && (
        <p className="text-text-tertiary text-sm text-center py-8">
          {t("empty")}
        </p>
      )}
    </div>
  );
}
