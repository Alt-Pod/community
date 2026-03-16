"use client";

import { useTranslations } from "next-intl";
import { Heading } from "@community/ui";
import LogbookViewer from "@/components/logbook-viewer";
import LogbookEntryList from "@/components/logbook-entry-list";

export default function LogbookPage() {
  const t = useTranslations("logbook");

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="mb-6">
        <Heading as="h1" className="text-2xl">
          {t("title")}
        </Heading>
        <p className="mt-1 text-sm text-text-secondary">{t("subtitle")}</p>
      </div>

      <div className="rounded-lg bg-surface-primary border border-border-subtle shadow-elevated p-6 mb-6">
        <LogbookViewer />
      </div>

      <div className="rounded-lg bg-surface-primary border border-border-subtle shadow-elevated p-6">
        <LogbookEntryList />
      </div>
    </div>
  );
}
