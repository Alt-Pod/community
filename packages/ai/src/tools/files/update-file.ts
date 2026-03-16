import { tool, zodSchema } from "ai";
import { z } from "zod";
import { fileService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const updateFileTool: CommunityToolDefinition = {
  meta: {
    id: "files.update_file",
    category: "files",
    displayName: "tools.files.updateFile.name",
    description: "Update file metadata",
    requiresConfirmation: true,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Update the metadata of a file (e.g. alt text, description, tags). Does not change the file content itself.",
      inputSchema: zodSchema(
        z.object({
          file_id: z.string().describe("The ID of the file to update"),
          metadata: z
            .record(z.string(), z.unknown())
            .describe(
              "New metadata object (e.g. { alt: 'Photo of sunset', description: 'Taken at beach' })"
            ),
        })
      ),
      needsApproval: true,
      execute: async ({ file_id, metadata }) => {
        const file = await fileService.updateFileMetadata(
          file_id,
          ctx.userId,
          metadata
        );
        if (!file) {
          return { error: "File not found" };
        }
        return { success: true, id: file.id, metadata: file.metadata };
      },
    }),
};
