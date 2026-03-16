import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { CommunityToolDefinition } from "../types";
import { githubFetch, repoPath } from "./github-client";

export const listDirectoryTool: CommunityToolDefinition = {
  meta: {
    id: "github.list_directory",
    category: "github",
    displayName: "tools.github.listDirectory.name",
    description: "List contents of a directory in the GitHub repository",
    requiresConfirmation: false,
  },
  tool: tool({
    description:
      "List the files and subdirectories in a directory of the application's GitHub repository. Use this to explore the project structure.",
    inputSchema: zodSchema(
      z.object({
        path: z
          .string()
          .optional()
          .describe(
            "Directory path relative to the repository root. Defaults to the root directory."
          ),
        ref: z
          .string()
          .optional()
          .describe("Branch, tag, or commit SHA. Defaults to 'main'."),
      })
    ),
    execute: async ({ path, ref }) => {
      const dirPath = path ?? "";
      const branch = ref ?? "main";
      const url = dirPath
        ? `${repoPath()}/contents/${dirPath}?ref=${branch}`
        : `${repoPath()}/contents?ref=${branch}`;

      const response = await githubFetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          return { error: `Directory not found: ${dirPath || "/"}` };
        }
        return { error: `GitHub API error: ${response.status}` };
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        return {
          error: `'${dirPath}' is a file, not a directory. Use the read_file tool instead.`,
        };
      }

      const entries = data
        .map((item: { name: string; path: string; type: string; size: number }) => ({
          name: item.name,
          path: item.path,
          type: item.type === "dir" ? "dir" : "file",
          size: item.size,
        }))
        .sort((a: { type: string; name: string }, b: { type: string; name: string }) => {
          if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });

      return entries;
    },
  }),
};
