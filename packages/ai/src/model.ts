import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import type { Provider } from "@community/shared";

export function getModel(provider: Provider = "google") {
  if (provider === "anthropic") {
    return anthropic("claude-sonnet-4-6");
  }
  return google("gemini-2.5-flash");
}
