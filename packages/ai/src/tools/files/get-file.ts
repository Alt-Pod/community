import { tool, zodSchema } from "ai";
import { z } from "zod";
import { fileService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const getFileTool: CommunityToolDefinition = {
  meta: {
    id: "files.get_file",
    category: "files",
    displayName: "tools.files.getFile.name",
    description: "Get file details and download link",
    requiresConfirmation: false,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Get details and a download URL for a specific file by its ID.",
      inputSchema: zodSchema(
        z.object({
          file_id: z.string().describe("The ID of the file to retrieve"),
        })
      ),
      execute: async ({ file_id }) => {
        const file = await fileService.getFile(file_id, ctx.userId);
        if (!file) {
          return { error: "File not found" };
        }
        return {
          id: file.id,
          filename: file.filename,
          mime_type: file.mime_type,
          size_bytes: file.size_bytes,
          category: file.category,
          metadata: file.metadata,
          url: file.url,
          created_at: file.created_at,
        };
      },
    }),
};
