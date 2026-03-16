import type { AgentRepository } from "../repositories/agentRepository";

export class AgentService {
  constructor(private agentRepository: AgentRepository) {}

  async getAll() {
    return this.agentRepository.findAll();
  }

  async findById(id: string) {
    return this.agentRepository.findById(id);
  }

  async getByUserId(userId: string) {
    return this.agentRepository.findByUserId(userId);
  }

  async create(data: {
    name: string;
    description?: string | null;
    system_prompt: string;
    user_id?: string | null;
  }) {
    return this.agentRepository.create(data);
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      system_prompt?: string;
      status?: "active" | "inactive";
    }
  ) {
    return this.agentRepository.update(id, data);
  }

  async delete(id: string) {
    return this.agentRepository.update(id, { status: "inactive" });
  }
}
