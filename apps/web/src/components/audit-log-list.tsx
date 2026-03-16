"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Card } from "@community/ui";
import type { AuditLog } from "@community/shared";

interface AuditLogListProps {
  logs: AuditLog[];
}

function entityLink(entityType: string, entityId: string | null): string | null {
  if (!entityId) return null;
  switch (entityType) {
    case "conversation":
      return `/chat/${entityId}`;
    case "meeting":
      return `/meetings/${entityId}`;
    case "agent":
      return `/agents/${entityId}`;
    default:
      return null;
  }
}

function eventTypeColor(eventType: string): string {
  if (eventType.includes("created") || eventType.includes("uploaded") || eventType.includes("saved") || eventType.includes("scheduled")) {
    return "bg-green-100 text-green-800";
  }
  if (eventType.includes("deleted")) {
    return "bg-red-100 text-red-800";
  }
  if (eventType.includes("updated")) {
    return "bg-blue-100 text-blue-800";
  }
  if (eventType.includes("started") || eventType.includes("completed")) {
    return "bg-amber-100 text-amber-800";
  }
  return "bg-gray-100 text-gray-800";
}

export default function AuditLogList({ logs }: AuditLogListProps) {
  const t = useTranslations("logs");

  if (logs.length === 0) {
    return (
      <p className="text-sm text-text-tertiary text-center py-10">
        {t("noLogs")}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => {
        const link = entityLink(log.entity_type, log.entity_id);
        // "conversation.created" → "eventTypes.conversation.created" (next-intl resolves dots as nesting)
        const eventKey = `eventTypes.${log.event_type}`;
        const entityKey = `entityTypes.${log.entity_type}`;
        // Use the translation key if it exists, fall back to raw value
        let eventLabel: string;
        try {
          eventLabel = t(eventKey);
        } catch {
          eventLabel = log.event_type.replace(".", " ");
        }
        let entityLabel: string;
        try {
          entityLabel = t(entityKey);
        } catch {
          entityLabel = log.entity_type;
        }

        return (
          <Card key={log.id}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${eventTypeColor(log.event_type)}`}
                >
                  {eventLabel}
                </span>
                <span className="text-xs text-text-tertiary whitespace-nowrap">
                  {entityLabel}
                </span>
                {link ? (
                  <Link
                    href={link}
                    className="text-xs text-accent hover:underline truncate"
                  >
                    {log.entity_id?.slice(0, 8)}...
                  </Link>
                ) : log.entity_id ? (
                  <span className="text-xs text-text-tertiary truncate">
                    {log.entity_id.slice(0, 8)}...
                  </span>
                ) : null}
                {log.details && Object.keys(log.details).length > 0 && (
                  <span className="text-xs text-text-tertiary truncate">
                    {Object.entries(log.details)
                      .slice(0, 2)
                      .map(([k, v]) => `${k}: ${String(v)}`)
                      .join(", ")}
                  </span>
                )}
              </div>
              <span className="text-xs text-text-tertiary whitespace-nowrap">
                {new Date(log.created_at).toLocaleString(undefined, {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
