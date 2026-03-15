"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Heading, ErrorBanner, LoadingIndicator } from "@community/ui";
import { useAgent, useDeleteAgent } from "@/requests/useAgents";
import AgentToolManager from "@/components/agent-tool-manager";

export default function AgentDetailPage() {
  const t = useTranslations("agents");
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: agent, isLoading, error } = useAgent(params.id);
  const deleteMutation = useDeleteAgent();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <LoadingIndicator text={t("loading")} />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <ErrorBanner message={t("detail.notFound")} />
        <div className="mt-4">
          <Link href="/agents" className="text-accent-gold hover:text-accent-gold-light hover:underline text-sm">
            {t("detail.backToList")}
          </Link>
        </div>
      </div>
    );
  }

  function handleDelete() {
    deleteMutation.mutate(agent!.id, {
      onSuccess: () => router.push("/agents"),
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link
        href="/agents"
        className="text-accent-gold hover:text-accent-gold-light hover:underline text-sm"
      >
        {t("detail.backToList")}
      </Link>

      <div className="mt-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <Heading as="h1" className="text-2xl">{agent.name}</Heading>
            {agent.description && (
              <p className="text-text-secondary mt-2">{agent.description}</p>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/agents/${agent.id}/edit`)}
            >
              {t("detail.editButton")}
            </Button>
            {!confirmDelete ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                {t("detail.deleteButton")}
              </Button>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
              >
                {t("detail.deleteConfirm")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* System Prompt */}
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-2">
            {t("detail.systemPrompt")}
          </h3>
          <pre className="font-mono text-sm bg-surface-tertiary border border-border-subtle rounded-md p-4 whitespace-pre-wrap">
            {agent.system_prompt}
          </pre>
        </div>

        {/* Tools */}
        <AgentToolManager agentId={agent.id} />

        {/* Metadata */}
        <div className="flex gap-8 text-sm text-text-tertiary border-t border-border-subtle pt-4">
          <div>
            <span className="font-medium text-text-secondary">{t("detail.status")}: </span>
            <span className={agent.status === "active" ? "text-accent-gold" : "text-text-tertiary"}>
              {agent.status === "active" ? t("detail.statusActive") : t("detail.statusInactive")}
            </span>
          </div>
          <div>
            <span className="font-medium text-text-secondary">{t("detail.createdAt")}: </span>
            {new Date(agent.created_at).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium text-text-secondary">{t("detail.updatedAt")}: </span>
            {new Date(agent.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
