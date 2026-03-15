import { tool, zodSchema, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import type { CommunityToolDefinition } from "../types";

export const GOOGLE_WEB_SEARCH_ID = "google.web_search";

export const webSearchTool: CommunityToolDefinition = {
  meta: {
    id: GOOGLE_WEB_SEARCH_ID,
    category: "google",
    displayName: "tools.google.webSearch.name",
    description: "Search the web for real-time information using Google",
    requiresConfirmation: false,
  },
  tool: tool({
    description:
      "Search the web for real-time information. Use this when the user asks about current events, recent data, or anything that requires up-to-date information.",
    inputSchema: zodSchema(
      z.object({
        query: z
          .string()
          .describe("The search query to find information on the web"),
      })
    ),
    execute: async ({ query }) => {
      const result = await generateText({
        model: google("gemini-2.5-flash"),
        tools: { google_search: google.tools.googleSearch({}) },
        prompt: query,
      });
      return result.text;
    },
  }),
};
