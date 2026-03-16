import { tool, zodSchema } from "ai";
import { z } from "zod";
import { fileService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const listFilesTool: CommunityToolDefinition = {
  meta: {
    id: "files.list_files",
    category: "files",
    displayName: "tools.files.listFiles.name",
    description: "List uploaded files",
    requiresConfirmation: false,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "List the user's uploaded files. Optionally filter by category: avatar, agent_avatar, chat_image, document, attachment.",
      inputSchema: zodSchema(
        z.object({
          category: z
            .string()
            .optional()
            .describe(
              "Optional category filter (avatar, agent_avatar, chat_image, document, attachment)"
            ),
        })
      ),
      execute: async ({ category }) => {
        const files = await fileService.listFiles(ctx.userId, { category });
        return files.map((f) => ({
          id: f.id,
          filename: f.filename,
          mime_type: f.mime_type,
          size_bytes: f.size_bytes,
          category: f.category,
          url: f.url,
          created_at: f.created_at,
        }));
      },
    }),
};
