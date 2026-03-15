import { auth, conversationService, chatService } from "@community/backend";
import { routeMessage, streamAgent } from "@community/ai";
import type { AgentMessage, Provider } from "@community/shared";
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
  const { messages, provider } = body as {
    messages: UIMessage[];
    provider?: Provider;
  };
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage ? extractText(lastMessage) : "";

  if (!userMessage) {
    return Response.json({ error: "No message provided" }, { status: 400 });
  }

  // Save the user message
  await chatService.saveUserMessage(id, userMessage);

  try {
    // Route to the right agent
    const agent = await routeMessage(userMessage, provider);

    // Build message history for the agent
    const history: AgentMessage[] = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: extractText(m),
    }));

    // Stream the agent's response
    const result = streamAgent(agent, history, provider);

    // Save assistant message when stream completes
    Promise.resolve(result.text)
      .then(async (text) => {
        await chatService.saveAssistantMessage(id, text, agent.id);
      })
      .catch(() => {});

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
