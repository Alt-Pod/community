"use client";

import { useTranslations } from "next-intl";
import { Card, StatusBadge, Heading, LoadingIndicator } from "@community/ui";
import MarkdownMessage from "@/components/markdown-message";
import type { DbMessage, ActivityOutcome } from "@community/shared";

interface TaskViewerProps {
  task: {
    activity: {
      id: string;
      title: string;
      status: string;
      payload: Record<string, unknown>;
      output: Record<string, unknown> | null;
      outcome: ActivityOutcome | null;
      created_at: string;
      completed_at: string | null;
    };
    agent: { id: string; name: string } | null;
    messages: DbMessage[];
    goal: string;
    summary: string | null;
    summary_title: string | null;
  };
}

function statusVariant(
  status: string
): "pending" | "running" | "success" | "error" {
  switch (status) {
    case "scheduled":
      return "pending";
    case "running":
      return "running";
    case "completed":
      return "success";
    case "failed":
      return "error";
    case "cancelled":
      return "pending";
    default:
      return "pending";
  }
}

function outcomeVariant(
  type: string
): "success" | "pending" | "error" {
  switch (type) {
    case "goal_reached":
      return "success";
    case "needs_user_input":
      return "error";
    case "needs_follow_up":
      return "pending";
    default:
      return "pending";
  }
}

function outcomeLabel(type: string): string {
  switch (type) {
    case "goal_reached":
      return "Goal Reached";
    case "needs_user_input":
      return "Needs Input";
    case "needs_follow_up":
      return "Needs Follow-up";
    default:
      return type;
  }
}

export default function TaskViewer({ task }: TaskViewerProps) {
  const t = useTranslations("meetings");
  const { activity, agent, messages, goal, summary, outcome } = {
    ...task,
    outcome: task.activity.outcome,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Heading as="h1" className="text-2xl">
            {activity.title}
          </Heading>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-secondary">
            {agent && <span>Agent: {agent.name}</span>}
            <span>
              {new Date(activity.created_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <StatusBadge
            variant={statusVariant(activity.status)}
            label={t(`status.${activity.status}`)}
          />
          {outcome && (
            <StatusBadge
              variant={outcomeVariant(outcome.type)}
              label={outcomeLabel(outcome.type)}
            />
          )}
        </div>
      </div>

      {/* Goal */}
      <Card>
        <Heading as="h3" className="text-sm font-semibold mb-2">
          Goal
        </Heading>
        <p className="text-sm text-text-secondary whitespace-pre-wrap">{goal}</p>
      </Card>

      {/* Outcome details */}
      {outcome?.type === "needs_user_input" && outcome.user_prompt && (
        <Card>
          <Heading as="h3" className="text-sm font-semibold mb-2 text-warning">
            Input Needed
          </Heading>
          <p className="text-sm text-text-secondary">{outcome.user_prompt}</p>
        </Card>
      )}

      {outcome?.type === "needs_follow_up" && outcome.follow_up_hint && (
        <Card>
          <Heading as="h3" className="text-sm font-semibold mb-2">
            Follow-up Needed
          </Heading>
          <p className="text-sm text-text-secondary">{outcome.follow_up_hint}</p>
        </Card>
      )}

      {/* Transcript */}
      {messages.length > 0 ? (
        <div className="space-y-3">
          <Heading as="h3" className="text-base">
            Activity Log
          </Heading>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-lg p-3 bg-bg-primary border border-border"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-text-primary">
                  {msg.role === "assistant"
                    ? agent?.name || "Agent"
                    : "System"}
                </span>
                <span className="text-xs text-text-tertiary">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="text-sm text-text-secondary">
                <MarkdownMessage content={msg.content} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-tertiary text-center py-6">
          Task has not started yet.
        </p>
      )}

      {/* Summary */}
      {summary && (
        <Card>
          <Heading as="h3" className="text-sm font-semibold mb-2">
            {task.summary_title ?? "Task Summary"}
          </Heading>
          <div className="text-sm text-text-secondary">
            <MarkdownMessage content={summary} />
          </div>
        </Card>
      )}
    </div>
  );
}
