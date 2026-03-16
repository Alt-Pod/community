import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { CommunityToolDefinition } from "../types";

export const promptMultiSelectTool: CommunityToolDefinition = {
  meta: {
    id: "prompt.multi_select",
    category: "prompt",
    displayName: "tools.prompt.multiSelect.name",
    description: "Present a multi-choice selection to the user",
    requiresConfirmation: false,
    universal: true,
  },
  tool: tool({
    description:
      "Present a list of options where the user can select multiple items. Use this when the user can choose more than one option.",
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
        min: z
          .number()
          .optional()
          .describe("Minimum number of selections required"),
        max: z
          .number()
          .optional()
          .describe("Maximum number of selections allowed"),
      })
    ),
    outputSchema: zodSchema(
      z.object({
        selected: z
          .array(z.string())
          .describe("The values the user selected"),
      })
    ),
  }),
};
