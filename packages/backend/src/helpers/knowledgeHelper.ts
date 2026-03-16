import type { KnowledgeEntry } from "@community/shared";

export function formatKnowledgeForContext(entries: KnowledgeEntry[]): string {
  if (entries.length === 0) return "";

  const lines = entries.map((e) => {
    const meta = [e.category];
    if (e.source) meta.push(`source: ${e.source}`);
    return `- [${meta.join(", ")}] ${e.content}`;
  });

  return `## Prior Knowledge\n\n${lines.join("\n")}`;
}
