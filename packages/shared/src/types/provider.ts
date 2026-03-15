export type Provider = "google" | "anthropic";

export const PROVIDERS: { id: Provider; label: string; model: string }[] = [
  { id: "google", label: "Gemini Flash", model: "gemini-2.5-flash" },
  { id: "anthropic", label: "Claude Sonnet", model: "claude-sonnet-4-6" },
];
