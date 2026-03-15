import { generateText, streamText } from "ai";
import { getModel, type Provider } from "./model";
import { buildSystemPrompt } from "./context";
import type { Agent, AgentMessage, AgentResponse } from "./types";

export async function runAgent(
  agent: Agent,
  messages: AgentMessage[],
  provider?: Provider
): Promise<AgentResponse> {
  const system = buildSystemPrompt(agent);

  const result = await generateText({
    model: getModel(provider),
    system,
    messages,
  });

  return {
    content: result.text,
    agent_id: agent.id,
    agent_name: agent.name,
  };
}

export function streamAgent(
  agent: Agent,
  messages: AgentMessage[],
  provider?: Provider
) {
  const system = buildSystemPrompt(agent);

  return streamText({
    model: getModel(provider),
    system,
    messages,
  });
}
