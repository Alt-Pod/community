import { tool, zodSchema } from "ai";
import { z } from "zod";
import { fileService, extractFileContent } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const readFileTool: CommunityToolDefinition = {
  meta: {
    id: "files.read_file",
    category: "files",
    displayName: "tools.files.readFile.name",
    description: "Read and extract content from a file",
    requiresConfirmation: false,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Read the content of a file by its ID. For text files (TXT, CSV), PDF, and DOCX, returns the extracted text content. For images, returns a signed URL that can be used for visual analysis.",
      inputSchema: zodSchema(
        z.object({
          file_id: z.string().describe("The ID of the file to read"),
        })
      ),
      execute: async ({ file_id }) => {
        const file = await fileService.getFile(file_id, ctx.userId);
        if (!file) {
          return { error: "File not found" };
        }

        const isImage = file.mime_type.startsWith("image/");
        if (isImage) {
          return {
            type: "image" as const,
            filename: file.filename,
            mime_type: file.mime_type,
            url: file.url,
          };
        }

        const { content, truncated } = await extractFileContent(
          file.storage_key,
          file.mime_type
        );

        return {
          type: "document" as const,
          filename: file.filename,
          mime_type: file.mime_type,
          content,
          truncated,
          size_bytes: file.size_bytes,
        };
      },
    }),
};
