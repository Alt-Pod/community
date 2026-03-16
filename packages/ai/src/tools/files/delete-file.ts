import { tool, zodSchema } from "ai";
import { z } from "zod";
import { fileService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const deleteFileTool: CommunityToolDefinition = {
  meta: {
    id: "files.delete_file",
    category: "files",
    displayName: "tools.files.deleteFile.name",
    description: "Permanently delete a file",
    requiresConfirmation: true,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Permanently delete a file by its ID. This removes the file from storage and cannot be undone.",
      inputSchema: zodSchema(
        z.object({
          file_id: z.string().describe("The ID of the file to delete"),
        })
      ),
      needsApproval: true,
      execute: async ({ file_id }) => {
        const deleted = await fileService.deleteFile(file_id, ctx.userId);
        return { success: deleted };
      },
    }),
};
