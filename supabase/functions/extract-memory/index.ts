// deno-lint-ignore-file no-explicit-any
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { getUserClient, requireUserId } from "../_shared/supabase.ts";
import { loadLifeContext, lifeContextPrompt } from "../_shared/context.ts";
import { claudeStructured } from "../_shared/claude.ts";
import { memoryFactsOutputSchema } from "../_shared/schema.ts";

const SYSTEM = `You are LifeOS — extracting durable, behaviorally-useful facts about this specific user from their executions, check-ins, and modifications.

You are building the LIFE GRAPH — the durable memory that future schedule generations will use. Quality matters more than quantity.

GOOD FACTS (atomic, behavioral, future-actionable):
- "Performs best lifting at 7am, not 9am — bar speed drops with later starts"
- "Skips workouts when sleep < 6h"
- "High-carb breakfast improves training performance"
- "Studies best for 90 min then needs a real break"
- "Feels best socially with 1-2 deep hangs/week, not many shallow ones"
- "Burnout follows 3+ consecutive days with stress > 7"

BAD FACTS (don't extract):
- "User completed bench press" (a single event, not a pattern)
- "User likes oats" (preferences without behavioral consequence)
- Anything emotional/judgmental about the user as a person

CONFIDENCE:
- 30-50: single observation
- 50-75: pattern across 3+ observations
- 75-90: clear consistent pattern
- 90+: only if user has confirmed it

Return ONLY new facts that aren't already in the existing memory. Update confidence on existing facts ONLY if you have stronger evidence.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { client } = getUserClient(req);
    const userId = await requireUserId(client);
    const { date } = await req.json();
    if (!date) return errorResponse("date required", 400);

    // Wider window for inference: last 14 days of executions/checkins
    const ctx = await loadLifeContext(client, userId, { days: 14, topMemory: 50 });

    const userPrompt = [
      lifeContextPrompt(ctx),
      "",
      `## TASK`,
      `Reflect on the last 14 days. Return atomic, behavioral, future-actionable facts about this user via the \`extract_facts\` tool.`,
      `Today's date: ${date}.`,
      `Avoid duplicating existing memory facts. Only return NEW or stronger versions.`,
    ].join("\n");

    const result = await claudeStructured<{
      facts: { domain?: string; fact: string; confidence?: number; source?: string; evidence?: any }[];
    }>({
      system: SYSTEM,
      user: userPrompt,
      toolName: "extract_facts",
      toolDescription: "Submit new memory facts learned about the user.",
      schema: memoryFactsOutputSchema,
      maxTokens: 4000,
    });

    const rows = (result.facts ?? []).map((f) => ({
      user_id: userId,
      domain: (f.domain ?? null) as any,
      fact: f.fact,
      confidence: Math.max(0, Math.min(100, f.confidence ?? 50)),
      source: f.source ?? "inferred",
      evidence: f.evidence ?? {},
      user_confirmed: false,
      active: true,
    }));

    if (rows.length > 0) {
      const { error } = await client.from("memory_facts").insert(rows);
      if (error) throw error;
    }

    return jsonResponse({ facts: result.facts ?? [] });
  } catch (e) {
    console.error("[extract-memory] error", e);
    return errorResponse((e as Error).message, 500);
  }
});
