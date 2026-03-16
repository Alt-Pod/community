import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { CommunityToolDefinition } from "../types";

export const promptSelectTool: CommunityToolDefinition = {
  meta: {
    id: "prompt.select",
    category: "prompt",
    displayName: "tools.prompt.select.name",
    description: "Present a single-choice selection to the user",
    requiresConfirmation: false,
    universal: true,
  },
  tool: tool({
    description:
      "Present a selection of options to the user and wait for their choice. Use this when you need the user to pick exactly one option from a list.",
    inputSchema: zodSchema(
      z.object({
        question: z.string().describe("The question to ask the user"),
        options: z
          .array(
            z.object({
              label: z.string().describe("Display label for the option"),
              value: z.string().describe("Value returned when selected"),
            })
          )
          .describe("The options to present"),
      })
    ),
    outputSchema: zodSchema(
      z.object({
        selected: z.string().describe("The value the user selected"),
      })
    ),
  }),
};
