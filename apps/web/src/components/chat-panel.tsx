"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import type { UIMessage } from "ai";
import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { DbMessage } from "@community/shared";
import {
  Button,
  TextArea,
  Heading,
  MessageBubble,
  SidebarItem,
  SidebarLayout,
  ErrorBanner,
  EmptyState,
  LoadingIndicator,
} from "@community/ui";
import { useConversations } from "@/requests/useConversations";
import { useDeleteConversation } from "@/requests/useDeleteConversation";
import { usePrefetchMessages } from "@/requests/useMessages";
import { useAgents } from "@/requests/useAgents";
import { createConversation } from "@/requests/api/conversationsApi";
import MarkdownMessage from "@/components/markdown-message";
import AgentPicker from "@/components/agent-picker";
import AppNavbar from "@/components/app-navbar";
import ToolCallCard from "@/components/tool-call-card";
import ToolConfirmationCard from "@/components/tool-confirmation-card";
import ToolResultCard from "@/components/tool-result-card";
import PromptToolRenderer from "@/components/prompt-tool-renderer";

export default function ChatPanel({ conversationId }: { conversationId?: string }) {
  const t = useTranslations("chat");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [pendingAgentId, setPendingAgentId] = useState<string | null | undefined>(
    conversationId ? null : undefined
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConversationId = conversationId ?? null;
  const conversationIdRef = useRef(activeConversationId);
  conversationIdRef.current = activeConversationId;

  const pendingAgentIdRef = useRef(pendingAgentId);
  pendingAgentIdRef.current = pendingAgentId;

  const creatingConversationRef = useRef<Promise<string> | null>(null);

  const { data: conversations = [] } = useConversations();
  const deleteConversationMutation = useDeleteConversation();
  const prefetchMessages = usePrefetchMessages();
  const { data: agents = [] } = useAgents();

  const transportRef = useRef(
    new DefaultChatTransport({
      api: "/api/conversations",
      fetch: async (_input, init) => {
        let convId = conversationIdRef.current;

        if (!convId) {
          if (!creatingConversationRef.current) {
            creatingConversationRef.current = (async () => {
              let title = "New conversation";
              try {
                const parsed = JSON.parse(init?.body as string);
                const lastMsg = parsed.messages?.[parsed.messages.length - 1];
                if (lastMsg?.content) title = String(lastMsg.content).slice(0, 100);
              } catch {}

              const agentId = pendingAgentIdRef.current;
              const conv = await createConversation(title, agentId);
              conversationIdRef.current = conv.id;
              // Update URL without unmounting — a full router.replace would
              // navigate to /chat/[id], destroying the in-flight stream.
              window.history.replaceState(null, "", `/chat/${conv.id}`);
              queryClient.invalidateQueries({ queryKey: ["conversations"] });
              return conv.id;
            })();
          }

          convId = await creatingConversationRef.current;
        }

        return fetch(`/api/conversations/${convId}/messages`, init);
      },
    })
  );

  const { messages, setMessages, sendMessage, addToolApprovalResponse, addToolOutput, status, error } = useChat({
    transport: transportRef.current,
    sendAutomaticallyWhen: (opts) =>
      lastAssistantMessageIsCompleteWithApprovalResponses(opts) ||
      lastAssistantMessageIsCompleteWithToolCalls(opts),
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    if (status === "streaming" || status === "submitted") {
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages, status]);

  const isLoading = status === "streaming" || status === "submitted";

  // Show agent picker when starting a new conversation (no active conversation and no pending selection)
  const showAgentPicker = !activeConversationId && pendingAgentId === undefined;

  const loadConversation = useCallback(async (id: string) => {
    const msgs = await prefetchMessages(id);
    setPendingAgentId(null); // not in picker mode
    setMessages(
      msgs.map((m: DbMessage) => ({
        id: m.id,
        role: m.role,
        parts: (Array.isArray(m.parts) ? m.parts : [{ type: "text" as const, text: m.content }]) as UIMessage["parts"],
      }))
    );
    if (id !== conversationId) {
      router.push(`/chat/${id}`);
    }
  }, [prefetchMessages, setMessages, conversationId, router]);

  // Load conversation messages on mount when navigating to /chat/[id]
  useEffect(() => {
    if (conversationId && !initialLoaded) {
      setInitialLoaded(true);
      loadConversation(conversationId);
    }
  }, [conversationId, initialLoaded, loadConversation]);

  function newChat() {
    setPendingAgentId(undefined); // show picker
    setMessages([]);
    router.push("/chat");
  }

  function handleAgentSelect(agentId: string | null) {
    setPendingAgentId(agentId);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage({ text });
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <span className="font-heading text-sm font-medium tracking-widest uppercase text-text-secondary">
          {t("sidebar.title")}
        </span>
        <Button variant="secondary" size="sm" onClick={newChat}>
          {t("sidebar.newButton")}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {conversations.map((c) => (
          <SidebarItem
            key={c.id}
            title={c.title || t("sidebar.untitled")}
            active={activeConversationId === c.id}
            onClick={() => loadConversation(c.id)}
            onDelete={() => {
              deleteConversationMutation.mutate(c.id);
              if (activeConversationId === c.id) newChat();
            }}
          />
        ))}
        {conversations.length === 0 && (
          <p className="px-5 py-6 text-xs text-text-tertiary text-center">
            {t("sidebar.empty")}
          </p>
        )}
      </div>
    </>
  );

  return (
    <SidebarLayout
      navbar={<AppNavbar />}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      sidebar={sidebarContent}
      header={<Heading as="h1" className="text-lg">{t("header.title")}</Heading>}
      footer={
        !showAgentPicker ? (
          <form onSubmit={onSubmit} className="px-8 py-5 border-t border-border-subtle">
            <div className="flex gap-3 items-end">
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !isLoading) {
                      onSubmit(e as unknown as FormEvent);
                    }
                  }
                }}
                placeholder={t("messages.placeholder")}
                autoFocus
              />
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || !input.trim()}
              >
                {t("messages.send")}
              </Button>
            </div>
          </form>
        ) : undefined
      }
    >
      {showAgentPicker ? (
        <AgentPicker agents={agents} onSelect={handleAgentSelect} />
      ) : (
        <>
          {error && <ErrorBanner message={error.message} />}

          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-8 py-6 space-y-6">
            {messages.length === 0 && <EmptyState message={t("messages.empty")} />}
            {messages.map((m) => {
              const parts = m.parts ?? [];
              const textParts = parts.filter(
                (p): p is { type: "text"; text: string } => p.type === "text"
              );
              const toolParts = parts.filter(
                (p) => typeof p.type === "string" && p.type.startsWith("tool-")
              );
              const text = textParts.map((p) => p.text).join("");

              return (
                <div key={m.id} className="min-w-0">
                  {m.role === "user" && text && (
                    <MessageBubble role="user">{text}</MessageBubble>
                  )}
                  {toolParts.map((part, i) => {
                    const toolPart = part as unknown as {
                      type: string;
                      toolCallId: string;
                      toolName?: string;
                      state: string;
                      input?: Record<string, unknown>;
                      output?: unknown;
                      errorText?: string;
                      approval?: {
                        id: string;
                        approved?: boolean;
                        reason?: string;
                      };
                    };
                    const toolName = toolPart.type.replace(/^tool-/, "");

                    if (toolName.startsWith("prompt.")) {
                      return (
                        <PromptToolRenderer
                          key={toolPart.toolCallId || i}
                          toolName={toolName}
                          input={toolPart.input ?? {}}
                          state={toolPart.state}
                          output={toolPart.output}
                          onSubmit={(output) =>
                            addToolOutput({
                              tool: toolPart.type as any,
                              toolCallId: toolPart.toolCallId,
                              output: output as any,
                            })
                          }
                        />
                      );
                    }

                    if (toolPart.state === "approval-requested") {
                      return (
                        <ToolConfirmationCard
                          key={toolPart.toolCallId || i}
                          toolName={toolName}
                          args={toolPart.input ?? {}}
                          approvalId={toolPart.approval?.id ?? toolPart.toolCallId}
                          onApprove={(id) =>
                            addToolApprovalResponse({ id, approved: true })
                          }
                          onReject={(id) =>
                            addToolApprovalResponse({ id, approved: false })
                          }
                        />
                      );
                    }

                    if (toolPart.state === "output-available") {
                      return (
                        <ToolResultCard
                          key={toolPart.toolCallId || i}
                          toolName={toolName}
                          output={toolPart.output}
                        />
                      );
                    }

                    if (toolPart.state === "output-error") {
                      return (
                        <ToolResultCard
                          key={toolPart.toolCallId || i}
                          toolName={toolName}
                          output={null}
                          errorText={toolPart.errorText}
                        />
                      );
                    }

                    if (toolPart.state === "output-denied") {
                      return (
                        <ToolResultCard
                          key={toolPart.toolCallId || i}
                          toolName={toolName}
                          output={null}
                          denied
                        />
                      );
                    }

                    // input-streaming, input-available, approval-responded
                    return (
                      <ToolCallCard
                        key={toolPart.toolCallId || i}
                        toolName={toolName}
                        args={toolPart.input as Record<string, unknown>}
                        state={toolPart.state}
                      />
                    );
                  })}
                  {m.role === "assistant" && text && (
                    <MessageBubble role="assistant">
                      <MarkdownMessage content={text} />
                    </MessageBubble>
                  )}
                </div>
              );
            })}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <LoadingIndicator text={t("messages.loading")} />
            )}
          </div>
        </>
      )}
    </SidebarLayout>
  );
}
