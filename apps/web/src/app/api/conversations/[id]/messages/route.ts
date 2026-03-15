import {
  auth,
  conversationService,
  chatService,
  agentService,
  toolService,
  buildPartsFromSteps,
} from "@community/backend";
import { streamAgentChat, streamDefaultChat, generateConversationTitle } from "@community/ai";
import type { UIMessage } from "ai";

function extractText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const conversation = await conversationService.findById(id, session.user.id);
  if (!conversation) {
    return new Response("Not found", { status: 404 });
  }

  const messages = await chatService.getMessages(id);
  return Response.json(messages);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const conversation = await conversationService.findById(id, session.user.id);
  if (!conversation) {
    return new Response("Not found", { status: 404 });
  }

  const body = await req.json();
  const { messages } = body as { messages: UIMessage[] };
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage?.role === "user" ? extractText(lastMessage) : "";

  // Save user message only when there's a new one (not on tool approval continuations)
  if (userMessage) {
    await chatService.saveUserMessage(id, userMessage);
  }

  // Background: generate a conversation title if not already done
  if (userMessage && !(conversation as { title_generated?: boolean }).title_generated) {
    const allMessages = await chatService.getMessages(id);
    if (allMessages.length >= 2) {
      generateConversationTitle(
        allMessages.map((m) => ({
          role: String(m.role) as "user" | "assistant",
          content: String(m.content),
        }))
      )
        .then(async (title) => {
          if (title) {
            await conversationService.updateTitle(id, title);
          }
        })
        .catch(() => {});
    }
  }

  // At least one message is required
  if (messages.length === 0) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  try {
    const agentId = (conversation as { agent_id?: string | null }).agent_id;

    if (agentId) {
      // Agent mode: use the agent's system prompt + its assigned tools
      const agent = await agentService.findById(agentId);
      if (!agent) {
        return Response.json({ error: "Agent not found" }, { status: 404 });
      }

      const toolIds = await toolService.getToolsForAgent(agentId);
      const result = await streamAgentChat(agent, messages, toolIds);

      Promise.resolve(result.steps)
        .then(async (steps) => {
          const text = steps.map((s) => s.text).join("");
          const parts = buildPartsFromSteps(steps);
          await chatService.saveAssistantMessage(id, text, agent.id, parts);
        })
        .catch(() => {});

      return result.toUIMessageStreamResponse();
    } else {
      // Default mode: concierge with agent management tools
      const agents = await agentService.getAll();
      const allToolIds = [
        "agents.list_agents",
        "agents.create_agent",
        "agents.update_agent",
        "agents.delete_agent",
        "google.web_search",
      ];
      const result = await streamDefaultChat(agents, messages, allToolIds);

      Promise.resolve(result.steps)
        .then(async (steps) => {
          const text = steps.map((s) => s.text).join("");
          const parts = buildPartsFromSteps(steps);
          await chatService.saveAssistantMessage(id, text, undefined, parts);
        })
        .catch(() => {});

      return result.toUIMessageStreamResponse();
    }
  } catch (error: unknown) {
    console.error("[messages/route] Error:", error);
    console.error("[messages/route] Messages:", JSON.stringify(messages.map(m => ({ id: m.id, role: m.role, parts: m.parts?.map(p => p.type) })), null, 2));
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
