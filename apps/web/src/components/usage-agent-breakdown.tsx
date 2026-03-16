"use client";

interface AgentEntry {
  agentId: string | null;
  agentName: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

interface UsageAgentBreakdownProps {
  data: AgentEntry[];
  t: (key: string) => string;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function UsageAgentBreakdown({
  data,
  t,
}: UsageAgentBreakdownProps) {
  if (data.length === 0) {
    return (
      <p className="text-text-tertiary text-sm text-center py-6">
        {t("noData")}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-text-secondary">
            <th className="text-left py-2 font-medium">{t("agent")}</th>
            <th className="text-right py-2 font-medium">{t("inputTokens")}</th>
            <th className="text-right py-2 font-medium">
              {t("outputTokens")}
            </th>
            <th className="text-right py-2 font-medium">{t("cost")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr
              key={entry.agentId ?? "default"}
              className="border-b border-border-subtle"
            >
              <td className="py-2 text-text-primary">{entry.agentName}</td>
              <td className="py-2 text-right text-text-secondary">
                {formatTokens(entry.inputTokens)}
              </td>
              <td className="py-2 text-right text-text-secondary">
                {formatTokens(entry.outputTokens)}
              </td>
              <td className="py-2 text-right text-text-primary font-medium">
                ${entry.cost.toFixed(4)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
