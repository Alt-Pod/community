"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heading } from "@community/ui";
import { useUsageStats } from "@/requests/useUsage";
import AppNavbar from "@/components/app-navbar";
import UsageSummaryCards from "@/components/usage-summary-cards";
import UsageDailyChart from "@/components/usage-daily-chart";
import UsageAgentBreakdown from "@/components/usage-agent-breakdown";
import ExternalServicesLinks from "@/components/external-services-links";

const RANGES = ["today", "week", "month"] as const;
type Range = (typeof RANGES)[number];

const RANGE_LABEL_KEY: Record<Range, string> = {
  today: "rangeToday",
  week: "rangeWeek",
  month: "rangeMonth",
};

function daysInRange(range: Range): number {
  if (range === "today") return 1;
  if (range === "week") return 7;
  const now = new Date();
  return now.getDate();
}

export default function BillingPage() {
  const t = useTranslations("billing");
  const [range, setRange] = useState<Range>("month");
  const { data, isLoading } = useUsageStats(range);

  return (
    <div className="min-h-screen bg-surface-primary">
      <AppNavbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Heading as="h1" className="text-2xl">
            {t("title")}
          </Heading>
          <p className="text-text-secondary text-sm mt-1">{t("subtitle")}</p>
        </div>

        {/* Range selector */}
        <div className="flex gap-2 mb-6">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 text-sm rounded-md border transition-colors duration-150 ${
                range === r
                  ? "border-accent-gold bg-accent-gold-pale/30 text-text-primary font-medium"
                  : "border-border-subtle bg-surface-primary text-text-secondary hover:border-accent-gold-muted"
              }`}
            >
              {t(RANGE_LABEL_KEY[r])}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="text-text-tertiary text-sm py-8 text-center">
            Loading...
          </p>
        )}

        {data && (
          <div className="space-y-8">
            {/* Summary cards */}
            <UsageSummaryCards
              totalInputTokens={data.totalInputTokens}
              totalOutputTokens={data.totalOutputTokens}
              estimatedCost={data.estimatedCost}
              daysInRange={daysInRange(range)}
              t={t}
            />

            {/* Daily usage chart */}
            <section>
              <h2 className="font-heading text-lg font-semibold text-text-primary mb-3">
                {t("dailyUsage")}
              </h2>
              <div className="p-4 border border-border-subtle rounded-md bg-surface-primary">
                <UsageDailyChart data={data.dailyBreakdown} t={t} />
              </div>
            </section>

            {/* Agent breakdown */}
            <section>
              <h2 className="font-heading text-lg font-semibold text-text-primary mb-3">
                {t("agentBreakdown")}
              </h2>
              <div className="p-4 border border-border-subtle rounded-md bg-surface-primary">
                <UsageAgentBreakdown data={data.agentBreakdown} t={t} />
              </div>
            </section>

            {/* External services */}
            <section>
              <h2 className="font-heading text-lg font-semibold text-text-primary mb-2">
                {t("externalServices")}
              </h2>
              <p className="text-text-secondary text-sm mb-3">
                {t("externalServicesDescription")}
              </p>
              <ExternalServicesLinks t={t} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
