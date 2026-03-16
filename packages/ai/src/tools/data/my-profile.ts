import { tool, zodSchema } from "ai";
import { z } from "zod";
import { userService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const myProfileTool: CommunityToolDefinition = {
  meta: {
    id: "data.my_profile",
    category: "data",
    displayName: "tools.data.myProfile.name",
    description: "Read your own user profile",
    requiresConfirmation: false,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Retrieve the current user's profile information (name, email, account creation date). Never exposes sensitive data.",
      inputSchema: zodSchema(z.object({})),
      execute: async () => {
        const profile = await userService.getProfile(ctx.userId);
        if (!profile) return { error: "Profile not found" };
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          created_at: profile.created_at,
        };
      },
    }),
};
