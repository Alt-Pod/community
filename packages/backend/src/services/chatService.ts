import type { MessageRepository } from "../repositories/messageRepository";

export class ChatService {
  constructor(private messageRepository: MessageRepository) {}

  async getMessages(conversationId: string) {
    return this.messageRepository.findByConversationId(conversationId);
  }

  async saveUserMessage(conversationId: string, content: string) {
    return this.messageRepository.create({
      conversationId,
      role: "user",
      content,
    });
  }

  async saveAssistantMessage(conversationId: string, content: string, agentId?: string) {
    return this.messageRepository.create({
      conversationId,
      role: "assistant",
      content,
      agentId,
    });
  }
}
