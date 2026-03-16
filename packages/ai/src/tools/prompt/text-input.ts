import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { CommunityToolDefinition } from "../types";

export const promptTextInputTool: CommunityToolDefinition = {
  meta: {
    id: "prompt.text_input",
    category: "prompt",
    displayName: "tools.prompt.textInput.name",
    description: "Ask the user for free-text input",
    requiresConfirmation: false,
    universal: true,
  },
  tool: tool({
    description:
      "Ask the user for free-text input. Use this when you need a typed response such as a name, description, or any open-ended answer.",
    inputSchema: zodSchema(
      z.object({
        question: z.string().describe("The question to ask the user"),
        placeholder: z
          .string()
          .optional()
          .describe("Placeholder text for the input field"),
        multiline: z
          .boolean()
          .optional()
          .describe("Whether to show a multi-line text area instead of a single-line input"),
      })
    ),
    outputSchema: zodSchema(
      z.object({
        text: z.string().describe("The text the user entered"),
      })
    ),
  }),
};
