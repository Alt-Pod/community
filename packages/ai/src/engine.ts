import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { getModel } from "./model";
import { buildAgentSystemPrompt, buildDefaultSystemPrompt } from "./context";
import { buildToolsForAgent } from "./tools";
import type { ToolContext } from "./tools";
import type { Agent } from "@community/shared";

export async function streamAgentChat(
  agent: Agent,
  messages: UIMessage[],
  toolIds: string[],
  ctx: ToolContext
) {
  const system = buildAgentSystemPrompt(agent, ctx.lang, ctx.timezone);
  const tools = buildToolsForAgent(toolIds, ctx);
  const modelMessages = await convertToModelMessages(messages, {
    ignoreIncompleteToolCalls: true,
  });

  return streamText({
    model: getModel(),
    system,
    messages: modelMessages,
    tools,
  });
}

export async function streamDefaultChat(
  agents: Agent[],
  messages: UIMessage[],
  toolIds: string[],
  ctx: ToolContext
) {
  const system = buildDefaultSystemPrompt(agents, ctx.lang, ctx.timezone);
  const tools = buildToolsForAgent(toolIds, ctx);
  const modelMessages = await convertToModelMessages(messages, {
    ignoreIncompleteToolCalls: true,
  });

  return streamText({
    model: getModel(),
    system,
    messages: modelMessages,
    tools,
  });
}
