import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";

export type Provider = "google" | "anthropic";

export const PROVIDERS: { id: Provider; label: string; model: string }[] = [
  { id: "google", label: "Gemini Flash", model: "gemini-2.5-flash" },
  { id: "anthropic", label: "Claude Sonnet", model: "claude-sonnet-4-6" },
];

export function getModel(provider: Provider = "google") {
  if (provider === "anthropic") {
    return anthropic("claude-sonnet-4-6");
  }
  return google("gemini-2.5-flash");
}
