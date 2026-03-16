"use client";

interface DailyEntry {
  date: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

interface UsageDailyChartProps {
  data: DailyEntry[];
  t: (key: string) => string;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function UsageDailyChart({ data, t }: UsageDailyChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-text-tertiary text-sm text-center py-6">
        {t("noData")}
      </p>
    );
  }

  const maxTokens = Math.max(
    ...data.map((d) => d.inputTokens + d.outputTokens),
    1
  );

  return (
    <div className="space-y-2">
      {data.map((day) => {
        const total = day.inputTokens + day.outputTokens;
        const pct = (total / maxTokens) * 100;
        const inputPct = total > 0 ? (day.inputTokens / total) * pct : 0;
        const outputPct = pct - inputPct;

        return (
          <div key={day.date} className="flex items-center gap-3 text-sm">
            <span className="w-24 text-text-secondary shrink-0">
              {new Date(day.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            <div className="flex-1 flex h-5 rounded overflow-hidden bg-surface-secondary">
              <div
                className="bg-accent-gold-muted"
                style={{ width: `${inputPct}%` }}
                title={`${t("inputTokens")}: ${formatTokens(day.inputTokens)}`}
              />
              <div
                className="bg-accent-gold"
                style={{ width: `${outputPct}%` }}
                title={`${t("outputTokens")}: ${formatTokens(day.outputTokens)}`}
              />
            </div>
            <span className="w-16 text-right text-text-tertiary shrink-0">
              {formatTokens(total)}
            </span>
            <span className="w-20 text-right text-text-tertiary shrink-0">
              ${day.cost.toFixed(4)}
            </span>
          </div>
        );
      })}
      <div className="flex items-center gap-4 mt-3 text-xs text-text-tertiary">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-accent-gold-muted" />
          {t("inputTokens")}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-accent-gold" />
          {t("outputTokens")}
        </span>
      </div>
    </div>
  );
}
