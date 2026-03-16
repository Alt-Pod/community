import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { CommunityToolDefinition } from "../types";
import { githubFetch, repoPath } from "./github-client";

const MAX_CONTENT_LENGTH = 100_000;

export const readFileTool: CommunityToolDefinition = {
  meta: {
    id: "github.read_file",
    category: "github",
    displayName: "tools.github.readFile.name",
    description: "Read a file from the GitHub repository",
    requiresConfirmation: false,
  },
  tool: tool({
    description:
      "Read the contents of a file from the application's GitHub repository. Use this to inspect source code, configuration files, or any other file in the codebase.",
    inputSchema: zodSchema(
      z.object({
        path: z
          .string()
          .describe(
            "File path relative to the repository root, e.g. 'packages/ai/src/model.ts'"
          ),
        ref: z
          .string()
          .optional()
          .describe("Branch, tag, or commit SHA. Defaults to 'main'."),
      })
    ),
    execute: async ({ path, ref }) => {
      const branch = ref ?? "main";
      const response = await githubFetch(
        `${repoPath()}/contents/${path}?ref=${branch}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return { error: `File not found: ${path}` };
        }
        return { error: `GitHub API error: ${response.status}` };
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        return {
          error: `'${path}' is a directory, not a file. Use the list_directory tool instead.`,
        };
      }

      if (data.type !== "file") {
        return { error: `'${path}' is not a file (type: ${data.type})` };
      }

      const raw = Buffer.from(data.content, "base64");

      if (raw.includes(0)) {
        return {
          path: data.path,
          size: data.size,
          sha: data.sha,
          content: null,
          message: "Binary file — cannot display contents",
          truncated: false,
        };
      }

      const fullContent = raw.toString("utf-8");
      const truncated = fullContent.length > MAX_CONTENT_LENGTH;

      return {
        path: data.path,
        size: data.size,
        sha: data.sha,
        content: truncated
          ? fullContent.slice(0, MAX_CONTENT_LENGTH)
          : fullContent,
        truncated,
      };
    },
  }),
};
