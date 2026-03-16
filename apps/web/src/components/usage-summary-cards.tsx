"use client";

interface UsageSummaryCardsProps {
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCost: number;
  daysInRange: number;
  t: (key: string) => string;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatCost(n: number): string {
  return `$${n.toFixed(4)}`;
}

export default function UsageSummaryCards({
  totalInputTokens,
  totalOutputTokens,
  estimatedCost,
  daysInRange,
  t,
}: UsageSummaryCardsProps) {
  const avgCost = daysInRange > 0 ? estimatedCost / daysInRange : 0;

  const cards = [
    {
      label: t("totalTokens"),
      value: formatTokens(totalInputTokens + totalOutputTokens),
      sub: `${formatTokens(totalInputTokens)} ${t("inputTokens").toLowerCase()} / ${formatTokens(totalOutputTokens)} ${t("outputTokens").toLowerCase()}`,
    },
    {
      label: t("estimatedCost"),
      value: formatCost(estimatedCost),
      sub: null,
    },
    {
      label: t("avgCostPerDay"),
      value: formatCost(avgCost),
      sub: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="p-5 border border-border-subtle rounded-md bg-surface-primary"
        >
          <p className="text-sm text-text-secondary">{card.label}</p>
          <p className="mt-1 text-2xl font-heading font-semibold text-text-primary">
            {card.value}
          </p>
          {card.sub && (
            <p className="mt-1 text-xs text-text-tertiary">{card.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
