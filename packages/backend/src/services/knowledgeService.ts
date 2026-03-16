import type { KnowledgeRepository } from "../repositories/knowledgeRepository";

export class KnowledgeService {
  constructor(private knowledgeRepository: KnowledgeRepository) {}

  async getEntries(
    userId: string,
    filters?: { category?: string; agentId?: string }
  ) {
    if (filters?.category) {
      return this.knowledgeRepository.findByUserIdAndCategory(
        userId,
        filters.category
      );
    }
    if (filters?.agentId) {
      return this.knowledgeRepository.findByAgentId(userId, filters.agentId);
    }
    return this.knowledgeRepository.findByUserId(userId);
  }

  async saveEntry(
    userId: string,
    data: {
      agentId?: string | null;
      category: string;
      content: string;
      source?: string | null;
    }
  ) {
    return this.knowledgeRepository.create({
      userId,
      agentId: data.agentId,
      category: data.category,
      content: data.content,
      source: data.source,
    });
  }

  async deleteEntry(id: string, userId: string) {
    return this.knowledgeRepository.deleteById(id, userId);
  }
}
