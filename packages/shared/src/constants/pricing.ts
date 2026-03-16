// Gemini 2.5 Flash pricing per token
export const MODEL_PRICING: Record<
  string,
  { inputPerToken: number; outputPerToken: number }
> = {
  "gemini-2.5-flash": {
    inputPerToken: 0.15 / 1_000_000, // $0.15 per 1M input tokens
    outputPerToken: 0.6 / 1_000_000, // $0.60 per 1M output tokens
  },
};

export const DEFAULT_MODEL = "gemini-2.5-flash";
