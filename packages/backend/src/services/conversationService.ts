import type { ConversationRepository } from "../repositories/conversationRepository";
import type { MessageRepository } from "../repositories/messageRepository";
import type { ConversationType } from "@community/shared";
import { CONVERSATION_TYPES } from "@community/shared";

export class ConversationService {
  constructor(
    private conversationRepository: ConversationRepository,
    private messageRepository: MessageRepository
  ) {}

  async getByUserId(userId: string) {
    return this.conversationRepository.findByUserId(userId);
  }

  async create(
    userId: string,
    title: string,
    agentId?: string | null,
    type: ConversationType = CONVERSATION_TYPES.CHAT
  ) {
    return this.conversationRepository.create(userId, title, agentId, type);
  }

  async createMeetingConversation(userId: string, title: string) {
    return this.conversationRepository.create(userId, title, null, CONVERSATION_TYPES.MEETING);
  }

  async createTaskConversation(userId: string, title: string) {
    return this.conversationRepository.create(userId, title, null, CONVERSATION_TYPES.TASK);
  }

  async findById(id: string, userId: string) {
    return this.conversationRepository.findById(id, userId);
  }

  async findByIdInternal(id: string) {
    return this.conversationRepository.findByIdInternal(id);
  }

  async updateTitle(id: string, title: string) {
    return this.conversationRepository.updateTitle(id, title);
  }

  async updateEndedAt(id: string, endedAt: Date) {
    return this.conversationRepository.updateEndedAt(id, endedAt);
  }

  async getMeetingsByUserId(userId: string) {
    return this.conversationRepository.findMeetingsByUserId(userId);
  }

  async delete(id: string, userId: string) {
    await this.messageRepository.deleteByConversationId(id);
    return this.conversationRepository.deleteById(id, userId);
  }
}
