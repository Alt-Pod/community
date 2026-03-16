import { ToolRepository } from "../repositories/toolRepository";

export class ToolService {
  constructor(private toolRepository: ToolRepository) {}

  async getToolsForAgent(agentId: string): Promise<string[]> {
    return this.toolRepository.findByAgentId(agentId);
  }

  async setAgentTools(agentId: string, toolIds: string[]): Promise<void> {
    return this.toolRepository.setAgentTools(agentId, toolIds);
  }

  async assignToAgent(agentId: string, toolIds: string[]): Promise<void> {
    return this.toolRepository.assignToAgent(agentId, toolIds);
  }

  async removeFromAgent(agentId: string, toolIds: string[]): Promise<void> {
    return this.toolRepository.removeFromAgent(agentId, toolIds);
  }

  async getAllAssignments(): Promise<
    { tool_id: string; agent_id: string; agent_name: string }[]
  > {
    return this.toolRepository.findAllAssignments();
  }
}
