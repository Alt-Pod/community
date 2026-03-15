"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heading, ErrorBanner, LoadingIndicator } from "@community/ui";
import { useAgent, useUpdateAgent } from "@/requests/useAgents";
import AgentForm from "@/components/agent-form";

export default function AgentEditPage() {
  const t = useTranslations("agents");
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: agent, isLoading, error } = useAgent(params.id);
  const updateMutation = useUpdateAgent();

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

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link
        href={`/agents/${agent.id}`}
        className="text-accent-gold hover:text-accent-gold-light hover:underline text-sm"
      >
        {t("detail.backToList")}
      </Link>

      <Heading as="h1" className="text-2xl mt-6 mb-6">
        {t("edit.title")}
      </Heading>

      <AgentForm
        initial={agent}
        submitLabel={t("edit.saveButton")}
        isPending={updateMutation.isPending}
        error={updateMutation.error?.message ?? null}
        onCancel={() => router.push(`/agents/${agent.id}`)}
        onSubmit={(data) => {
          updateMutation.mutate(
            { id: agent.id, ...data },
            { onSuccess: () => router.push(`/agents/${agent.id}`) }
          );
        }}
      />
    </div>
  );
}
