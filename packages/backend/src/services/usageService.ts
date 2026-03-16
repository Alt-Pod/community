import type { UsageStats } from "@community/shared";
import { MODEL_PRICING, DEFAULT_MODEL } from "@community/shared";
import type { UsageRepository } from "../repositories/usageRepository";

export class UsageService {
  constructor(private usageRepository: UsageRepository) {}

  async logUsage(data: {
    userId: string;
    conversationId: string;
    agentId?: string | null;
    model: string;
    inputTokens: number;
    outputTokens: number;
  }) {
    return this.usageRepository.create(data);
  }

  async getStats(from: Date, to: Date): Promise<UsageStats> {
    const { totals, daily, byAgent } = await this.usageRepository.getStats(
      from,
      to
    );
    const pricing = MODEL_PRICING[DEFAULT_MODEL];

    const calcCost = (input: number, output: number) =>
      input * pricing.inputPerToken + output * pricing.outputPerToken;

    return {
      totalInputTokens: totals.total_input_tokens,
      totalOutputTokens: totals.total_output_tokens,
      estimatedCost: calcCost(
        totals.total_input_tokens,
        totals.total_output_tokens
      ),
      dailyBreakdown: (daily as any[]).map((d) => ({
        date: d.date,
        inputTokens: d.input_tokens,
        outputTokens: d.output_tokens,
        cost: calcCost(d.input_tokens, d.output_tokens),
      })),
      agentBreakdown: (byAgent as any[]).map((a) => ({
        agentId: a.agent_id,
        agentName: a.agent_name ?? "Community Assistant",
        inputTokens: a.input_tokens,
        outputTokens: a.output_tokens,
        cost: calcCost(a.input_tokens, a.output_tokens),
      })),
    };
  }
}
