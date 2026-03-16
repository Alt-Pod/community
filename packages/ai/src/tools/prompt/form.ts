import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { CommunityToolDefinition } from "../types";

const formFieldSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    name: z.string().describe("Field name used as key in the result"),
    label: z.string().describe("Label displayed above the field"),
    placeholder: z.string().optional().describe("Placeholder text"),
    required: z.boolean().optional().describe("Whether the field is required"),
  }),
  z.object({
    type: z.literal("textarea"),
    name: z.string().describe("Field name used as key in the result"),
    label: z.string().describe("Label displayed above the field"),
    placeholder: z.string().optional().describe("Placeholder text"),
    required: z.boolean().optional().describe("Whether the field is required"),
  }),
  z.object({
    type: z.literal("select"),
    name: z.string().describe("Field name used as key in the result"),
    label: z.string().describe("Label displayed above the field"),
    options: z.array(
      z.object({
        label: z.string().describe("Display label"),
        value: z.string().describe("Value returned when selected"),
      })
    ),
    required: z.boolean().optional().describe("Whether the field is required"),
  }),
  z.object({
    type: z.literal("number"),
    name: z.string().describe("Field name used as key in the result"),
    label: z.string().describe("Label displayed above the field"),
    min: z.number().optional().describe("Minimum value"),
    max: z.number().optional().describe("Maximum value"),
    required: z.boolean().optional().describe("Whether the field is required"),
  }),
]);

export const promptFormTool: CommunityToolDefinition = {
  meta: {
    id: "prompt.form",
    category: "prompt",
    displayName: "tools.prompt.form.name",
    description: "Present a composite form with multiple fields to the user",
    requiresConfirmation: false,
    universal: true,
  },
  tool: tool({
    description:
      "Present a form with multiple fields to the user. Use this when you need several pieces of information at once, such as a name and email, or a set of configuration values.",
    inputSchema: zodSchema(
      z.object({
        title: z.string().optional().describe("Optional title for the form"),
        fields: z
          .array(formFieldSchema)
          .describe("The fields to display in the form"),
      })
    ),
    outputSchema: zodSchema(
      z.object({
        values: z
          .record(z.string(), z.union([z.string(), z.number()]))
          .describe("The submitted field values keyed by field name"),
      })
    ),
  }),
};
