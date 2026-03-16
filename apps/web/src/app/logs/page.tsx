"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heading, LoadingIndicator, Select } from "@community/ui";
import { useLogs } from "@/requests/useLogs";
import AuditLogList from "@/components/audit-log-list";

const EVENT_TYPE_OPTIONS = [
  { value: "", label: "All events" },
  { value: "conversation.created", label: "Conversation created" },
  { value: "conversation.deleted", label: "Conversation deleted" },
  { value: "meeting.scheduled", label: "Meeting scheduled" },
  { value: "meeting.started", label: "Meeting started" },
  { value: "meeting.completed", label: "Meeting completed" },
  { value: "agent.created", label: "Agent created" },
  { value: "agent.updated", label: "Agent updated" },
  { value: "agent.deleted", label: "Agent deleted" },
  { value: "file.uploaded", label: "File uploaded" },
  { value: "file.deleted", label: "File deleted" },
];

const ENTITY_TYPE_OPTIONS = [
  { value: "", label: "All entities" },
  { value: "conversation", label: "Conversation" },
  { value: "meeting", label: "Meeting" },
  { value: "agent", label: "Agent" },
  { value: "file", label: "File" },
  { value: "knowledge_entry", label: "Knowledge" },
];

export default function LogsPage() {
  const t = useTranslations("logs");
  const [eventType, setEventType] = useState("");
  const [entityType, setEntityType] = useState("");

  const { data: logs = [], isLoading } = useLogs({
    eventType: eventType || undefined,
    entityType: entityType || undefined,
    limit: 100,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <Heading as="h1" className="text-2xl">
          {t("title")}
        </Heading>
        <div className="flex items-center gap-2">
          <Select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            options={EVENT_TYPE_OPTIONS}
          />
          <Select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            options={ENTITY_TYPE_OPTIONS}
          />
        </div>
      </div>

      {isLoading && <LoadingIndicator variant="inline" text={t("loading")} />}

      {!isLoading && <AuditLogList logs={logs} />}
    </div>
  );
}
