import { auth } from "@/lib/auth";
import sql from "@/lib/db";
import { routeMessage } from "@/lib/agents/router";
import { streamAgent } from "@/lib/agents/engine";
import type { AgentMessage } from "@/lib/agents/types";
import type { Provider } from "@/lib/agents/model";
import type { UIMessage } from "ai";

function extractText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { messages, provider } = body as {
    messages: UIMessage[];
    provider?: Provider;
  };
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage ? extractText(lastMessage) : "";

  if (!userMessage) {
    return new Response("No message provided", { status: 400 });
  }

  // Get or create conversation
  const [conv] = await sql`
    INSERT INTO conversations (user_id, title)
    VALUES (${session.user.id}, ${userMessage.slice(0, 100)})
    RETURNING id
  `;
  const convId = conv.id;

  // Save the user message
  await sql`
    INSERT INTO messages (conversation_id, role, content)
    VALUES (${convId}, 'user', ${userMessage})
  `;

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
        await sql`
          INSERT INTO messages (conversation_id, role, content, agent_id)
          VALUES (${convId}, 'assistant', ${text}, ${agent.id})
        `;
      })
      .catch(() => {});

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
