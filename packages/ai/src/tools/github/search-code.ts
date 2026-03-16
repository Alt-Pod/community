import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { CommunityToolDefinition } from "../types";
import { githubFetch, repoPath } from "./github-client";

export const searchCodeTool: CommunityToolDefinition = {
  meta: {
    id: "github.search_code",
    category: "github",
    displayName: "tools.github.searchCode.name",
    description: "Search for code patterns in the GitHub repository",
    requiresConfirmation: false,
  },
  tool: tool({
    description:
      "Search for code patterns in the application's GitHub repository. Rate-limited to 10 requests per minute without a token. Prefer read_file and list_directory when you already know the file path.",
    inputSchema: zodSchema(
      z.object({
        query: z.string().describe("The search term or code pattern to find"),
        path: z
          .string()
          .optional()
          .describe(
            "Restrict search to a directory path, e.g. 'packages/ai/src'"
          ),
        extension: z
          .string()
          .optional()
          .describe("Filter by file extension, e.g. 'ts', 'json'"),
      })
    ),
    execute: async ({ query, path, extension }) => {
      const repo = repoPath().replace("/repos/", "");
      let q = `${query} repo:${repo}`;
      if (path) q += ` path:${path}`;
      if (extension) q += ` extension:${extension}`;

      const response = await githubFetch(
        `/search/code?q=${encodeURIComponent(q)}&per_page=20`,
        { Accept: "application/vnd.github.text-match+json" }
      );

      if (!response.ok) {
        if (response.status === 403) {
          return {
            error:
              "GitHub search rate limit exceeded. Try again in a minute, or configure a GITHUB_TOKEN for higher limits.",
          };
        }
        return { error: `GitHub API error: ${response.status}` };
      }

      const data = await response.json();

      return (data.items ?? []).map(
        (item: {
          path: string;
          text_matches?: Array<{ fragment: string }>;
        }) => ({
          path: item.path,
          matches: (item.text_matches ?? []).map(
            (m: { fragment: string }) => m.fragment
          ),
        })
      );
    },
  }),
};
