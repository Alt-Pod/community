import type { ReactNode } from "react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  children: ReactNode;
}

export function MessageBubble({ role, children }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[65%] rounded-md px-4 py-2.5 text-sm ${
          isUser
            ? "bg-accent-gold-pale border border-accent-gold-muted/40 text-text-primary whitespace-pre-wrap"
            : "bg-surface-primary shadow-elevated text-text-primary border border-border-subtle"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
