interface StepToolCall {
  toolCallId: string;
  toolName: string;
  input: unknown;
}

interface StepToolResult {
  toolCallId: string;
  output: unknown;
}

interface StepData {
  text: string;
  toolCalls: StepToolCall[];
  toolResults: StepToolResult[];
}

export function buildPartsFromSteps(steps: StepData[]): unknown[] {
  const parts: unknown[] = [];

  for (const step of steps) {
    if (step.text) {
      parts.push({ type: "text", text: step.text });
    }

    for (const toolCall of step.toolCalls) {
      const matchingResult = step.toolResults.find(
        (r) => r.toolCallId === toolCall.toolCallId
      );

      parts.push({
        type: `tool-${toolCall.toolName}`,
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        state: "output-available",
        input: toolCall.input ?? {},
        output: matchingResult?.output ?? null,
      });
    }
  }

  return parts;
}
