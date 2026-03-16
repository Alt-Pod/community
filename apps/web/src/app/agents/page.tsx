"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, Heading, LoadingIndicator, SearchInput } from "@community/ui";
import type { Agent } from "@community/shared";
import { useAgents, useCreateAgent } from "@/requests/useAgents";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import AgentForm from "@/components/agent-form";
import AgentPickerTools from "@/components/agent-picker-tools";

export default function AgentsPage() {
  const t = useTranslations("agents");
  const tSearch = useTranslations("search");
  const { data: agents = [], isLoading } = useAgents();
  const createMutation = useCreateAgent();
  const [showCreate, setShowCreate] = useState(false);
  const fieldExtractor = useCallback(
    (a: Agent) => [a.name, a.description ?? ""],
    [],
  );
  const { query, setQuery, results } = useFuzzySearch(agents, fieldExtractor);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
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

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={tSearch("placeholder")}
        className="mb-6"
      />

      {isLoading && (
        <LoadingIndicator variant="inline" text={t("loading")} />
      )}

      <div className="space-y-4">
        {results.map((agent) => (
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

        {query && results.length === 0 && (
          <p className="text-text-tertiary text-sm text-center py-8">
            {tSearch("noResults")}
          </p>
        )}

        {!query && !isLoading && agents.length === 0 && (
          <p className="text-text-tertiary text-sm text-center py-8">
            {t("empty")}
          </p>
        )}
      </div>
    </div>
  );
}
