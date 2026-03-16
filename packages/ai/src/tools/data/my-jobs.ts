import { tool, zodSchema } from "ai";
import { z } from "zod";
import { jobService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const myJobsTool: CommunityToolDefinition = {
  meta: {
    id: "data.my_jobs",
    category: "data",
    displayName: "tools.data.myJobs.name",
    description: "List your background jobs",
    requiresConfirmation: false,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "List the current user's background jobs. Optionally filter by status or type. Returns job type, status, and timestamps.",
      inputSchema: zodSchema(
        z.object({
          status: z
            .enum(["pending", "running", "completed", "failed", "cancelled"])
            .optional()
            .describe("Filter by job status"),
          type: z
            .string()
            .optional()
            .describe("Filter by job type"),
        })
      ),
      execute: async ({ status, type }) => {
        const jobs = await jobService.getByUserId(ctx.userId, {
          status,
          type,
        });
        return jobs;
      },
    }),
};
