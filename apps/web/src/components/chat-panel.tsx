"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import type { UIMessage } from "ai";
import { useState, useRef, useEffect, useCallback, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { DbMessage } from "@community/shared";
import {
  Button,
  TextArea,
  MessageBubble,
  SidebarItem,
  SidebarLayout,
  ErrorBanner,
  EmptyState,
  LoadingIndicator,
  SearchInput,
} from "@community/ui";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useConversations } from "@/requests/useConversations";
import { useProfile } from "@/requests/useProfile";
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
import ToolBulkActions from "@/components/tool-bulk-actions";
import PromptToolRenderer from "@/components/prompt-tool-renderer";
import FileUploadTool from "@/components/file-upload-tool";
import ChatAttachmentPreview from "@/components/chat-attachment-preview";
import type { AttachedFile } from "@/components/chat-attachment-preview";
import { uploadFile } from "@/requests/api/filesApi";
import { ALLOWED_MIME_TYPES } from "@community/shared";

export default function ChatPanel({ conversationId }: { conversationId?: string }) {
  const t = useTranslations("chat");
  const { data: profile } = useProfile();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [pendingAgentId, setPendingAgentId] = useState<string | null | undefined>(
    conversationId ? null : undefined
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isListening, isSupported: isSpeechSupported, startListening, stopListening } = useSpeechRecognition(
    profile?.lang ?? "en",
    (text) => setInput((prev) => (prev ? prev + " " + text : text)),
  );

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
  const tSearch = useTranslations("search");
  const convFieldExtractor = useCallback(
    (c: { title: string }) => [c.title],
    [],
  );
  const { query: sidebarQuery, setQuery: setSidebarQuery, results: filteredConversations } = useFuzzySearch(conversations, convFieldExtractor);

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
    // Close sidebar overlay on mobile only
    if (window.matchMedia("(max-width: 767px)").matches) {
      setSidebarOpen(false);
    }
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

  const allAcceptedTypes = [...ALLOWED_MIME_TYPES.image, ...ALLOWED_MIME_TYPES.document].join(",");

  function handleFilesSelected(files: FileList | null) {
    if (!files) return;
    const maxNew = 5 - attachedFiles.length;
    const selected = Array.from(files).slice(0, maxNew);

    const newEntries: AttachedFile[] = selected.map((f) => ({
      localFile: f,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      uploading: true,
    }));

    setAttachedFiles((prev) => {
      const updated = [...prev, ...newEntries];
      // Start uploads
      newEntries.forEach((entry, i) => {
        const idx = prev.length + i;
        uploadFile(entry.localFile, "attachment")
          .then((result) => {
            setAttachedFiles((cur) =>
              cur.map((f, j) =>
                j === idx
                  ? {
                      ...f,
                      uploading: false,
                      uploaded: {
                        id: result.id,
                        url: result.url,
                        filename: result.filename,
                        mime_type: result.mime_type,
                      },
                    }
                  : f
              )
            );
          })
          .catch((err) => {
            setAttachedFiles((cur) =>
              cur.map((f, j) =>
                j === idx ? { ...f, uploading: false, error: err.message } : f
              )
            );
          });
      });
      return updated;
    });
  }

  function removeAttachment(index: number) {
    setAttachedFiles((prev) => {
      const file = prev[index];
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function dismissPendingToolCards() {
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        parts: msg.parts?.map((part) => {
          if (typeof (part as any).type !== "string" || !(part as any).type.startsWith("tool-")) return part;
          const tp = part as any;

          // Dismiss approval-requested tools
          if (tp.state === "approval-requested") {
            return { ...tp, state: "output-denied" };
          }

          // Dismiss pending prompt tools and file upload
          const toolName = (tp.type as string).replace(/^tool-/, "");
          const isInteractive = toolName.startsWith("prompt.") || toolName === "files.upload_file";
          const isTerminal = ["output-available", "output-error", "output-denied"].includes(tp.state);

          if (isInteractive && !isTerminal) {
            return { ...tp, state: "output-denied" };
          }

          return part;
        }),
      }))
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    const readyFiles = attachedFiles.filter((f) => f.uploaded && !f.error);
    const hasContent = text || readyFiles.length > 0;
    if (!hasContent || isLoading) return;

    dismissPendingToolCards();

    // Build document annotations for non-image files
    const docAnnotations = readyFiles
      .filter((f) => !f.uploaded!.mime_type.startsWith("image/"))
      .map((f) => `[Attached: ${f.uploaded!.filename} (file_id: ${f.uploaded!.id})]`)
      .join("\n");

    const fullText = docAnnotations
      ? text
        ? `${text}\n\n${docAnnotations}`
        : docAnnotations
      : text;

    // Build image file parts for multimodal
    const imageFiles = readyFiles.filter((f) =>
      f.uploaded!.mime_type.startsWith("image/")
    );
    const fileParts = imageFiles.map((f) => ({
      type: "file" as const,
      mediaType: f.uploaded!.mime_type,
      filename: f.uploaded!.filename,
      url: f.uploaded!.url,
    }));

    // Clean up previews
    attachedFiles.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });

    setInput("");
    setAttachedFiles([]);
    sendMessage({
      text: fullText,
      files: fileParts.length > 0 ? fileParts : undefined,
    });
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
      <div className="px-3 py-2 border-b border-border-subtle">
        <SearchInput
          value={sidebarQuery}
          onChange={setSidebarQuery}
          placeholder={tSearch("placeholder")}
        />
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredConversations.map((c) => (
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
        {sidebarQuery && filteredConversations.length === 0 && (
          <p className="px-5 py-6 text-xs text-text-tertiary text-center">
            {tSearch("noResults")}
          </p>
        )}
        {!sidebarQuery && conversations.length === 0 && (
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
      onCloseSidebar={() => setSidebarOpen(false)}
      sidebarToggle={
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary border-b border-border-subtle"
          aria-label={t("sidebar.toggle")}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="5" x2="17" y2="5" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="15" x2="17" y2="15" />
          </svg>
          {t("sidebar.title")}
        </button>
      }
      sidebar={sidebarContent}
      footer={
        !showAgentPicker ? (
          <form onSubmit={onSubmit} className="px-4 py-3 md:px-8 md:py-5 border-t border-border-subtle">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={allAcceptedTypes}
              className="hidden"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleFilesSelected(e.target.files);
                e.target.value = "";
              }}
            />
            {attachedFiles.length > 0 && (
              <ChatAttachmentPreview
                files={attachedFiles}
                onRemove={removeAttachment}
              />
            )}
            <div className="flex gap-3 items-end">
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const readyFiles = attachedFiles.filter((f) => f.uploaded && !f.error);
                    if ((input.trim() || readyFiles.length > 0) && !isLoading) {
                      onSubmit(e as unknown as FormEvent);
                    }
                  }
                }}
                placeholder={t("messages.placeholder")}
                autoFocus
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 p-2 text-text-secondary hover:text-text-primary transition-colors rounded-md hover:bg-bg-secondary"
                aria-label={t("attachments.button")}
                disabled={isLoading || attachedFiles.length >= 5}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.5 10.3l-7.78 7.78a4.5 4.5 0 0 1-6.36-6.36l7.78-7.78a3 3 0 0 1 4.24 4.24l-7.07 7.07a1.5 1.5 0 0 1-2.12-2.12L13.26 6" />
                </svg>
              </button>
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`flex-shrink-0 p-2 transition-colors rounded-md ${
                    isListening
                      ? "text-red-500 hover:text-red-600 animate-pulse"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
                  }`}
                  aria-label={isListening ? t("voice.listening") : t("voice.button")}
                  disabled={isLoading}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="7" y="1" width="6" height="11" rx="3" />
                    <path d="M4 9a6 6 0 0 0 12 0" />
                    <line x1="10" y1="15" x2="10" y2="19" />
                    <line x1="7" y1="19" x2="13" y2="19" />
                  </svg>
                </button>
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || (!input.trim() && attachedFiles.filter((f) => f.uploaded && !f.error).length === 0)}
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

          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 md:px-8 md:py-6 space-y-6">
            {messages.length === 0 && <EmptyState message={t("messages.empty")} />}
            {messages.map((m) => {
              const parts = m.parts ?? [];
              const textParts = parts.filter(
                (p): p is { type: "text"; text: string } => p.type === "text"
              );
              const toolParts = parts.filter(
                (p) => typeof p.type === "string" && p.type.startsWith("tool-")
              );
              const fileParts = parts.filter(
                (p): p is { type: "file"; url: string; mediaType: string; filename?: string } =>
                  p.type === "file"
              );
              const text = textParts.map((p) => p.text).join("");

              return (
                <div key={m.id} className="min-w-0">
                  {m.role === "user" && (text || fileParts.length > 0) && (
                    <MessageBubble role="user">
                      {fileParts.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {fileParts.map((fp, fi) => (
                            fp.mediaType?.startsWith("image/") ? (
                              <img
                                key={fi}
                                src={fp.url}
                                alt={fp.filename ?? ""}
                                className="max-w-[200px] max-h-[200px] rounded-md object-cover"
                              />
                            ) : (
                              <div key={fi} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-secondary text-xs">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M9 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.5L9 1.5z" />
                                  <path d="M9 1.5V5.5h4" />
                                </svg>
                                {fp.filename}
                              </div>
                            )
                          ))}
                        </div>
                      )}
                      {text}
                    </MessageBubble>
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

                    if (toolName === "files.upload_file") {
                      return (
                        <FileUploadTool
                          key={toolPart.toolCallId || i}
                          input={toolPart.input as any}
                          completed={toolPart.state === "output-available"}
                          dismissed={toolPart.state === "output-denied"}
                          output={toolPart.output as any}
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
                  {(() => {
                    const pendingApprovals = toolParts
                      .map((p) => p as unknown as {
                        type: string;
                        toolCallId: string;
                        state: string;
                        approval?: { id: string };
                      })
                      .filter((p) => p.state === "approval-requested");

                    return pendingApprovals.length >= 2 ? (
                      <ToolBulkActions
                        count={pendingApprovals.length}
                        onApproveAll={() =>
                          pendingApprovals.forEach((p) =>
                            addToolApprovalResponse({
                              id: p.approval?.id ?? p.toolCallId,
                              approved: true,
                            })
                          )
                        }
                        onRejectAll={() =>
                          pendingApprovals.forEach((p) =>
                            addToolApprovalResponse({
                              id: p.approval?.id ?? p.toolCallId,
                              approved: false,
                            })
                          )
                        }
                      />
                    ) : null;
                  })()}
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
