import { generateText } from "ai";
import { getModel } from "./model";

const TITLE_SYSTEM_PROMPT = `You are a conversation title generator. Given the messages of a conversation, generate a short, descriptive title (max 60 characters) that captures the main topic or intent.

Rules:
- Output ONLY the title text, nothing else
- No quotes, no punctuation at the end, no prefixes
- Be specific and descriptive, not generic
- Use sentence case
- If the conversation is too vague to title meaningfully, respond with exactly: SKIP`;

interface TitleMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateConversationTitle(
  messages: TitleMessage[]
): Promise<string | null> {
  const formatted = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n\n");

  const { text } = await generateText({
    model: getModel(),
    system: TITLE_SYSTEM_PROMPT,
    prompt: formatted,
  });

  const title = text.trim();

  if (!title || title === "SKIP") {
    return null;
  }

  return title.slice(0, 60);
}
