"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="font-heading text-xl font-semibold tracking-tight mb-2 mt-3 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-heading text-lg font-semibold tracking-tight mb-2 mt-3 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-heading text-base font-semibold tracking-tight mb-1 mt-2 first:mt-0">{children}</h3>
        ),
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
        li: ({ children }) => <li className="mb-0.5">{children}</li>,
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code className="block font-mono bg-surface-tertiary rounded-sm p-3 my-2 text-xs overflow-x-auto text-text-primary">
                {children}
              </code>
            );
          }
          return (
            <code className="font-mono bg-surface-tertiary rounded px-1.5 py-0.5 text-xs text-text-primary">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="my-2">{children}</pre>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-border-default pl-3 my-2 text-text-secondary">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-gold hover:text-accent-gold-light hover:underline"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <table className="border-collapse my-2 w-full text-xs">{children}</table>
        ),
        th: ({ children }) => (
          <th className="border border-border-default px-2 py-1 text-left font-bold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border border-border-subtle px-2 py-1">{children}</td>
        ),
        hr: () => <hr className="border-border-subtle my-3" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
