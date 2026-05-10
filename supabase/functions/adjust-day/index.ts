// deno-lint-ignore-file no-explicit-any
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { getUserClient, requireUserId, HttpError } from "../_shared/supabase.ts";
import { loadLifeContext, lifeContextPrompt } from "../_shared/context.ts";
import { claudeStructured } from "../_shared/claude.ts";
import { adjustDayOutputSchema } from "../_shared/schema.ts";

const SYSTEM = `You are LifeOS — adapting today's schedule to reality WITHOUT guilt.

The user is telling you what changed (bad sleep, sore, busy, sick, traveling, ate poorly, behind on work, etc.). Reshape today's blocks accordingly.

CORE PRINCIPLES:
- Adapt — don't punish. The user is informing you, not confessing.
- Preserve fixed commitments and high-priority goals when possible.
- Lower intensity rather than dropping the block when motivation/recovery is low.
- If time is short, give a SHORTER version of the same block, not a different block.
- If sick, prioritize sleep + nutrition + minimal movement.
- If traveling, prefer bodyweight + simple meal options.
- If the user ate something they "shouldn't" — don't shame. Adjust remaining meals.
- Keep the overall day still feeling intentional. Empty days are demoralizing.

Return the FULL revised list of today's blocks (including unchanged ones). Also return a brief diff_summary explaining what you changed and why.

detailed_plan.kind MUST match category. Same shape rules as generate-week.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { client } = getUserClient(req);
    const userId = await requireUserId(client);
    const { date, override, chips } = await req.json();
    if (!date) return errorResponse("date required", 400);

    const ctx = await loadLifeContext(client, userId);

    const { data: existing } = await client
      .from("time_blocks")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .order("start_time");

    const userPrompt = [
      lifeContextPrompt(ctx),
      "",
      `## CURRENT PLAN FOR ${date}`,
      JSON.stringify(existing ?? [], null, 2),
      "",
      `## REALITY UPDATE`,
      `Chips: ${(chips ?? []).join(", ") || "(none)"}`,
      `Free text: ${override || "(none)"}`,
      "",
      `## TASK`,
      `Reshape today's plan around this reality. Return JSON via the \`adjust_day\` tool.`,
    ].join("\n");

    const result = await claudeStructured<{ blocks: any[]; diff_summary: string }>({
      system: SYSTEM,
      user: userPrompt,
      toolName: "adjust_day",
      toolDescription: "Reshape today's blocks to match the new reality.",
      schema: adjustDayOutputSchema,
      maxTokens: 8000,
    });

    // Replace today's planned blocks (preserve completed/skipped/modified)
    await client
      .from("time_blocks")
      .delete()
      .eq("user_id", userId)
      .eq("date", date)
      .eq("status", "planned");

    const rows = result.blocks.map((b) => ({
      user_id: userId,
      date: b.date,
      start_time: b.start_time,
      end_time: b.end_time,
      category: b.category,
      title: b.title,
      why: b.why ?? null,
      intensity: b.intensity ?? null,
      priority: b.priority ?? null,
      detailed_plan: b.detailed_plan,
      success_criteria: b.success_criteria ?? null,
      status: "planned" as const,
    }));
    if (rows.length > 0) {
      const { error } = await client.from("time_blocks").insert(rows);
      if (error) throw error;
    }

    return jsonResponse({ blocks: result.blocks, diff_summary: result.diff_summary });
  } catch (e) {
    console.error("[adjust-day] error", e);
    const status = e instanceof HttpError ? e.status : 500;
    return errorResponse((e as Error).message, status);
  }
});
