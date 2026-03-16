import type { MessageRepository } from "../repositories/messageRepository";

export class ChatService {
  constructor(private messageRepository: MessageRepository) {}

  async getMessages(conversationId: string) {
    return this.messageRepository.findByConversationId(conversationId);
  }

  async saveUserMessage(conversationId: string, content: string, parts?: unknown[] | null) {
    return this.messageRepository.create({
      conversationId,
      role: "user",
      content,
      parts,
    });
  }

  async saveAssistantMessage(conversationId: string, content: string, agentId?: string, parts?: unknown[] | null) {
    return this.messageRepository.create({
      conversationId,
      role: "assistant",
      content,
      agentId,
      parts,
    });
  }

  async updatePromptToolOutputs(
    conversationId: string,
    incomingMessages: { role: string; parts?: unknown[] }[]
  ) {
    const lastAssistantMsg = [...incomingMessages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (!lastAssistantMsg?.parts || !Array.isArray(lastAssistantMsg.parts))
      return;

    const promptOutputs = lastAssistantMsg.parts.filter(
      (p: any) =>
        typeof p.type === "string" &&
        p.type.startsWith("tool-prompt.") &&
        p.state === "output-available"
    );
    if (promptOutputs.length === 0) return;

    const stored = await this.messageRepository.findByConversationId(
      conversationId
    );
    const lastStoredAssistant = [...stored]
      .reverse()
      .find((m: any) => m.role === "assistant");
    if (
      !lastStoredAssistant?.parts ||
      !Array.isArray(lastStoredAssistant.parts)
    )
      return;

    const updatedParts = (lastStoredAssistant.parts as any[]).map(
      (part: any) => {
        if (
          typeof part.type !== "string" ||
          !part.type.startsWith("tool-prompt.")
        )
          return part;
        const match = (promptOutputs as any[]).find(
          (p: any) => p.toolCallId === part.toolCallId
        );
        if (match) {
          return { ...part, state: "output-available", output: match.output };
        }
        return part;
      }
    );

    await this.messageRepository.updateParts(
      lastStoredAssistant.id,
      updatedParts
    );
  }
}
