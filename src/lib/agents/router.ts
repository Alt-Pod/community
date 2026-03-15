import { generateText } from "ai";
import { getModel, type Provider } from "./model";
import sql from "../db";
import type { Agent } from "./types";

export async function routeMessage(
  userMessage: string,
  provider?: Provider
): Promise<Agent> {
  const agents = await sql<Agent[]>`
    SELECT * FROM agents WHERE status = 'active'
  `;

  // Single agent? No routing needed.
  if (agents.length === 1) {
    return agents[0];
  }

  const agentList = agents
    .map((a) => `- id: ${a.id} | name: ${a.name} | purpose: ${a.purpose}`)
    .join("\n");

  const result = await generateText({
    model: getModel(provider),
    system: `You are a router for an AI organization. Given the user's message and the list of available agents, respond with ONLY the id of the best agent to handle this message. No explanation, just the UUID.

Available agents:
${agentList}`,
    messages: [{ role: "user", content: userMessage }],
  });

  const chosenId = result.text.trim();
  const chosen = agents.find((a) => a.id === chosenId);

  // Fallback to first agent (Chief of Staff) if routing fails
  return chosen ?? agents[0];
}
