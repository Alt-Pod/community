import { tool, zodSchema } from "ai";
import { z } from "zod";
import { FILE_CATEGORIES } from "@community/shared";
import type { FileCategory } from "@community/shared";
import type { CommunityToolDefinition } from "../types";

export const uploadFileTool: CommunityToolDefinition = {
  meta: {
    id: "files.upload_file",
    category: "files",
    displayName: "tools.files.uploadFile.name",
    description: "Upload a file or image",
    requiresConfirmation: false,
  },
  tool: tool({
    description:
      "Upload a file or image from the user's device. This opens a file picker for the user to select a file. Supported image types: JPEG, PNG, GIF, WebP, SVG (10 MB max). Supported document types: PDF, DOCX, TXT, CSV (25 MB max). The uploaded file is stored and can be referenced later by its ID.",
    inputSchema: zodSchema(
      z.object({
        category: z
          .enum(FILE_CATEGORIES as [FileCategory, ...FileCategory[]])
          .describe(
            "File category: avatar, agent_avatar, chat_image, document, attachment"
          ),
        prompt: z
          .string()
          .optional()
          .describe(
            "Optional prompt or instruction to display to the user (e.g. 'Please select your avatar image')"
          ),
      })
    ),
    outputSchema: zodSchema(
      z.object({
        success: z.boolean(),
        id: z.string().optional(),
        filename: z.string().optional(),
        mime_type: z.string().optional(),
        size_bytes: z.number().optional(),
        url: z.string().optional(),
        error: z.string().optional(),
      })
    ),
  }),
};
