import type { ConversationRepository } from "../repositories/conversationRepository";
import type { MessageRepository } from "../repositories/messageRepository";

export class ConversationService {
  constructor(
    private conversationRepository: ConversationRepository,
    private messageRepository: MessageRepository
  ) {}

  async getByUserId(userId: string) {
    return this.conversationRepository.findByUserId(userId);
  }

async create(userId: string, title: string, agentId?: string | null) {
    return this.conversationRepository.create(userId, title, agentId);
  }

  async findById(id: string, userId: string) {
    return this.conversationRepository.findById(id, userId);
  }

  async updateTitle(id: string, title: string) {
    return this.conversationRepository.updateTitle(id, title);
  }

  async delete(id: string, userId: string) {
    await this.messageRepository.deleteByConversationId(id);
    return this.conversationRepository.deleteById(id, userId);
  }
}
