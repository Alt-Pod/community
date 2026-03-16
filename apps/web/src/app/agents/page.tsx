"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, Heading } from "@community/ui";
import { useAgents, useCreateAgent } from "@/requests/useAgents";
import AgentForm from "@/components/agent-form";
import AgentPickerTools from "@/components/agent-picker-tools";

export default function AgentsPage() {
  const t = useTranslations("agents");
  const { data: agents = [], isLoading } = useAgents();
  const createMutation = useCreateAgent();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <Heading as="h1" className="text-2xl">
          {t("title")}
        </Heading>
        <Button variant="secondary" onClick={() => setShowCreate(true)}>
          {t("createButton")}
        </Button>
      </div>

      {showCreate && (
        <div className="mb-6">
          <AgentForm
            submitLabel={t("form.create")}
            onCancel={() => setShowCreate(false)}
            isPending={createMutation.isPending}
            error={createMutation.error?.message ?? null}
            onSubmit={(data) => {
              createMutation.mutate(data, {
                onSuccess: () => setShowCreate(false),
              });
            }}
          />
        </div>
      )}

      {isLoading && (
        <p className="text-text-tertiary text-sm">{t("loading")}</p>
      )}

      <div className="space-y-4">
        {agents.map((agent) => (
          <Link
            key={agent.id}
            href={`/agents/${agent.id}`}
            className="block p-5 border border-border-subtle rounded-md bg-surface-primary hover:border-accent-gold-muted hover:shadow-card transition-all duration-150"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-semibold text-text-primary">
                  {agent.name}
                </h3>
                {agent.description && (
                  <p className="text-sm text-text-secondary mt-1">
                    {agent.description}
                  </p>
                )}
              </div>
              <span className="text-text-tertiary text-sm ml-4">→</span>
            </div>
            <AgentPickerTools agentId={agent.id} />
          </Link>
        ))}

        {!isLoading && agents.length === 0 && (
          <p className="text-text-tertiary text-sm text-center py-8">
            {t("empty")}
          </p>
        )}
      </div>
    </div>
  );
}
