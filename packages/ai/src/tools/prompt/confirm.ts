import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { CommunityToolDefinition } from "../types";

export const promptConfirmTool: CommunityToolDefinition = {
  meta: {
    id: "prompt.confirm",
    category: "prompt",
    displayName: "tools.prompt.confirm.name",
    description: "Ask the user a yes/no confirmation question",
    requiresConfirmation: false,
    universal: true,
  },
  tool: tool({
    description:
      "Ask the user a yes/no confirmation question. Use this when you need a binary decision from the user.",
    inputSchema: zodSchema(
      z.object({
        question: z.string().describe("The confirmation question to ask"),
        confirmLabel: z
          .string()
          .optional()
          .describe("Custom label for the confirm button (defaults to 'Yes')"),
        denyLabel: z
          .string()
          .optional()
          .describe("Custom label for the deny button (defaults to 'No')"),
      })
    ),
    outputSchema: zodSchema(
      z.object({
        confirmed: z
          .boolean()
          .describe("Whether the user confirmed (true) or denied (false)"),
      })
    ),
  }),
};
