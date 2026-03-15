"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { Provider, DbMessage } from "@community/shared";
import { PROVIDERS } from "@community/shared";
import { useConversations } from "@/requests/useConversations";
import { useDeleteConversation } from "@/requests/useDeleteConversation";
import { usePrefetchMessages } from "@/requests/useMessages";
import { createConversation } from "@/requests/api/conversationsApi";

export default function ChatPanel() {
  const t = useTranslations("chat");
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<Provider>("google");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const providerRef = useRef(provider);
  providerRef.current = provider;

  const conversationIdRef = useRef(activeConversationId);
  conversationIdRef.current = activeConversationId;

  const { data: conversations = [] } = useConversations();
  const deleteConversationMutation = useDeleteConversation();
  const prefetchMessages = usePrefetchMessages();

  const transportRef = useRef(
    new DefaultChatTransport({
      api: "/api/conversations",
      body: () => ({
        provider: providerRef.current,
      }),
      fetch: async (_input, init) => {
        let convId = conversationIdRef.current;

        // Create conversation if one doesn't exist yet
        if (!convId) {
          let title = "New conversation";
          try {
            const parsed = JSON.parse(init?.body as string);
            const lastMsg = parsed.messages?.[parsed.messages.length - 1];
            if (lastMsg?.content) title = String(lastMsg.content).slice(0, 100);
          } catch {}

          const conv = await createConversation(title);
          convId = conv.id;
          setActiveConversationId(convId);
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }

        // POST to the RESTful messages endpoint
        return fetch(`/api/conversations/${convId}/messages`, init);
      },
    })
  );

  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport: transportRef.current,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const isLoading = status === "streaming" || status === "submitted";

  async function loadConversation(id: string) {
    const msgs = await prefetchMessages(id);
    setActiveConversationId(id);
    setMessages(
      msgs.map((m: DbMessage) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text" as const, text: m.content }],
      }))
    );
  }

  function newChat() {
    setActiveConversationId(null);
    setMessages([]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage({ text });
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-64 flex flex-col border-r border-gray-800 bg-gray-950">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
            <span className="text-sm font-medium text-gray-300">{t("sidebar.title")}</span>
            <button
              onClick={newChat}
              className="rounded-md bg-gray-800 px-2.5 py-1 text-xs text-gray-300 hover:bg-gray-700"
            >
              {t("sidebar.newButton")}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-2 px-4 py-3 cursor-pointer text-sm border-b border-gray-800/50 ${
                  activeConversationId === c.id
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
                }`}
                onClick={() => loadConversation(c.id)}
              >
                <span className="flex-1 truncate">{c.title || t("sidebar.untitled")}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversationMutation.mutate(c.id);
                    if (activeConversationId === c.id) newChat();
                  }}
                  className="hidden group-hover:block text-gray-500 hover:text-red-400 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="px-4 py-6 text-xs text-gray-600 text-center">{t("sidebar.empty")}</p>
            )}
          </div>
        </aside>
      )}

      {/* Main chat area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white text-sm"
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <h1 className="text-lg font-semibold text-white">{t("header.title")}</h1>
          </div>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            className="rounded-md bg-gray-900 border border-gray-700 px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </header>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-4 rounded-lg bg-red-900/50 border border-red-700 px-4 py-3 text-sm text-red-200">
            {error.message}
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600 text-sm">{t("messages.empty")}</p>
            </div>
          )}
          {messages.map((m) => {
            const text = m.parts
              .filter((p): p is { type: "text"; text: string } => p.type === "text")
              .map((p) => p.text)
              .join("");

            if (!text) return null;

            return (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-200"
                  }`}
                >
                  {text}
                </div>
              </div>
            );
          })}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-400 rounded-lg px-4 py-2.5 text-sm">
                {t("messages.loading")}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={onSubmit} className="px-6 py-4 border-t border-gray-800">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("messages.placeholder")}
              className="flex-1 rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("messages.send")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
