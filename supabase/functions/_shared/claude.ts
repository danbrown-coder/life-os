// Minimal Claude client. Uses tool_use for structured output: we define a
// single tool the model is forced to call, with a JSON schema for the result.

const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-5-20250929";

export interface ClaudeStructuredCallParams {
  system: string;
  user: string;
  toolName: string;
  toolDescription: string;
  // JSON Schema for the tool's input — what we want the model to return.
  schema: Record<string, unknown>;
  maxTokens?: number;
  model?: string;
}

export async function claudeStructured<T = unknown>(
  params: ClaudeStructuredCallParams
): Promise<T> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set on the Edge Function");

  const body = {
    model: params.model ?? DEFAULT_MODEL,
    max_tokens: params.maxTokens ?? 8000,
    system: params.system,
    tools: [
      {
        name: params.toolName,
        description: params.toolDescription,
        input_schema: params.schema,
      },
    ],
    tool_choice: { type: "tool", name: params.toolName },
    messages: [{ role: "user", content: params.user }],
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error (${res.status}): ${text}`);
  }

  const json = await res.json();
  const block = (json.content ?? []).find((c: { type: string }) => c.type === "tool_use");
  if (!block) {
    throw new Error("Claude did not return a tool_use block. Response: " + JSON.stringify(json));
  }
  return block.input as T;
}
