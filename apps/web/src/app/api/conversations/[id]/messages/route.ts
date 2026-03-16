import {
  auth,
  conversationService,
  chatService,
  agentService,
  toolService,
  buildPartsFromSteps,
  jobService,
  usageService,
  userService,
} from "@community/backend";
import { streamAgentChat, streamDefaultChat } from "@community/ai";
import type { UIMessage } from "ai";

function extractText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

/**
 * Sanitize tool parts that use "output-denied" state without an approval object.
 * The AI SDK expects `approval.reason` for denied tools — convert them to
 * "output-available" with null output to avoid the crash.
 */
function sanitizeMessages(messages: UIMessage[]): UIMessage[] {
  return messages.map((m) => ({
    ...m,
    parts: m.parts.map((p: any) => {
      if (
        typeof p.type === "string" &&
        p.type.startsWith("tool-") &&
        p.state === "output-denied" &&
        !p.approval
      ) {
        return { ...p, state: "output-available", output: p.output ?? null };
      }
      return p;
    }) as UIMessage["parts"],
  }));
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
  const { messages: rawMessages } = body as { messages: UIMessage[] };
  const messages = sanitizeMessages(rawMessages);
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage?.role === "user" ? extractText(lastMessage) : "";

  // Save user message only when there's a new one (not on tool approval continuations)
  if (userMessage) {
    const userParts = lastMessage?.parts?.length ? lastMessage.parts : undefined;
    await chatService.saveUserMessage(id, userMessage, userParts);
  }

  // If this is a tool-output continuation (no new user message),
  // update the stored assistant message with prompt tool outputs
  if (!userMessage) {
    await chatService.updatePromptToolOutputs(id, messages);
  }

  // Background: generate a conversation title if not already done
  if (userMessage && !(conversation as { title_generated?: boolean }).title_generated) {
    const allMessages = await chatService.getMessages(id);
    if (allMessages.length >= 2) {
      jobService.createJob(
        "title.generate",
        {},
        { conversationId: id, userId: session.user.id },
        { userId: session.user.id }
      ).catch(() => {});
    }
  }

  // At least one message is required
  if (messages.length === 0) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  try {
    const userProfile = await userService.getProfile(session.user.id);
    const userLang = (userProfile as { lang?: string })?.lang;
    const userTimezone = (userProfile as { timezone?: string })?.timezone;
    const agentId = (conversation as { agent_id?: string | null }).agent_id;

    if (agentId) {
      // Agent mode: use the agent's system prompt + its assigned tools
      const agent = await agentService.findById(agentId);
      if (!agent) {
        return Response.json({ error: "Agent not found" }, { status: 404 });
      }

      const toolIds = await toolService.getToolsForAgent(agentId);
      const result = await streamAgentChat(agent, messages, toolIds, {
        userId: session.user.id,
        agentId,
        lang: userLang,
        timezone: userTimezone,
      });

      Promise.resolve(result.steps)
        .then(async (steps) => {
          const text = steps.map((s) => s.text).join("");
          const parts = buildPartsFromSteps(steps);
          await chatService.saveAssistantMessage(id, text, agent.id, parts);
        })
        .catch(() => {});

      Promise.resolve(result.usage).then(async (usage) => {
        await usageService.logUsage({
          userId: session.user.id,
          conversationId: id,
          agentId,
          model: "gemini-2.5-flash",
          inputTokens: usage.inputTokens ?? 0,
          outputTokens: usage.outputTokens ?? 0,
        });
      }).catch(() => {});

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
        "knowledge.save_entry",
        "knowledge.get_entries",
        "knowledge.delete_entry",
        "github.read_file",
        "github.list_directory",
        "github.search_code",
        "data.my_profile",
        "data.my_conversations",
        "data.my_messages",
        "data.list_agents",
        "data.list_tools",
        "data.get_agent_details",
        "data.my_jobs",
        "data.my_logs",
        "data.my_meetings",
        "planning.schedule_activity",
        "planning.schedule_meeting",
        "planning.list_scheduled_activities",
        "planning.cancel_scheduled_activity",
        "files.upload_file",
        "files.list_files",
        "files.get_file",
        "files.read_file",
        "files.update_file",
        "files.delete_file",
      ];
      const result = await streamDefaultChat(agents, messages, allToolIds, {
        userId: session.user.id,
        lang: userLang,
        timezone: userTimezone,
      });

      Promise.resolve(result.steps)
        .then(async (steps) => {
          const text = steps.map((s) => s.text).join("");
          const parts = buildPartsFromSteps(steps);
          await chatService.saveAssistantMessage(id, text, undefined, parts);
        })
        .catch(() => {});

      Promise.resolve(result.usage).then(async (usage) => {
        await usageService.logUsage({
          userId: session.user.id,
          conversationId: id,
          agentId: null,
          model: "gemini-2.5-flash",
          inputTokens: usage.inputTokens ?? 0,
          outputTokens: usage.outputTokens ?? 0,
        });
      }).catch(() => {});

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
