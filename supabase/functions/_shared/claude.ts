// Minimal Claude client. Uses tool_use for structured output: we define a
// single tool the model is forced to call, with a JSON schema for the result.
//
// Two-tier model selection:
//   - tier "light"  (default) -> ANTHROPIC_MODEL  env var, defaults to Sonnet 4.6.
//   - tier "heavy"            -> ANTHROPIC_MODEL_HEAVY env var, defaults to Opus 4.7.
//
// The caller can also pass an explicit `model` to override both.
//
// Reliability: a single transparent retry on any failure (parse error, HTTP
// error, no tool_use block) with a stricter system suffix that forces the
// model to call the tool. This catches the "model returned prose instead of
// calling the tool" failure mode that Zod surfaces on the client.

const ANTHROPIC_VERSION = "2023-06-01";

const LIGHT_DEFAULT = "claude-sonnet-4-6";
const HEAVY_DEFAULT = "claude-opus-4-7";

const STRICTER_SUFFIX =
  "\n\nIMPORTANT: You MUST call the tool exactly as specified. " +
  "The tool input must strictly match the provided JSON schema. " +
  "Do not include any prose response. If you are uncertain about a field, " +
  "supply a reasonable default that satisfies the schema rather than omitting it.";

export type ClaudeTier = "light" | "heavy";

export interface ClaudeStructuredCallParams {
  system: string;
  user: string;
  toolName: string;
  toolDescription: string;
  // JSON Schema for the tool's input — what we want the model to return.
  schema: Record<string, unknown>;
  maxTokens?: number;
  // Pick a tier; "light" is the default if neither tier nor model is given.
  tier?: ClaudeTier;
  // Hard override; bypasses tier selection.
  model?: string;
}

function resolveModel(params: ClaudeStructuredCallParams): string {
  if (params.model) return params.model;
  if (params.tier === "heavy") {
    return Deno.env.get("ANTHROPIC_MODEL_HEAVY") ?? HEAVY_DEFAULT;
  }
  return Deno.env.get("ANTHROPIC_MODEL") ?? LIGHT_DEFAULT;
}

async function callClaudeOnce<T>(
  params: ClaudeStructuredCallParams,
  apiKey: string,
  systemOverride?: string
): Promise<T> {
  const body = {
    model: resolveModel(params),
    max_tokens: params.maxTokens ?? 8000,
    system: systemOverride ?? params.system,
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
  const block = (json.content ?? []).find(
    (c: { type: string }) => c.type === "tool_use"
  );
  if (!block) {
    throw new Error(
      "Claude did not return a tool_use block. Response: " +
        JSON.stringify(json).slice(0, 1000)
    );
  }
  return block.input as T;
}

export async function claudeStructured<T = unknown>(
  params: ClaudeStructuredCallParams
): Promise<T> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set on the Edge Function");

  try {
    return await callClaudeOnce<T>(params, apiKey);
  } catch (firstErr) {
    console.warn(
      "[claude] first attempt failed, retrying with stricter prompt:",
      (firstErr as Error).message
    );
    return await callClaudeOnce<T>(
      params,
      apiKey,
      params.system + STRICTER_SUFFIX
    );
  }
}
