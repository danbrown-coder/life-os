// deno-lint-ignore-file no-explicit-any
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { getUserClient, requireUserId } from "../_shared/supabase.ts";
import { loadLifeContext, lifeContextPrompt } from "../_shared/context.ts";
import { claudeStructured } from "../_shared/claude.ts";
import { reflectionOutputSchema } from "../_shared/schema.ts";

const SYSTEM = `You are LifeOS — running a weekly reflection that an elite coach would do.

Style:
- Direct, warm, useful. Not therapy. Not corporate.
- Talk about patterns, not single events.
- Surface what worked AND what's quietly draining the user.
- End with clear, actionable adjustments for next week — not platitudes.

Avoid:
- Guilt
- Generic motivational language
- Listing what the user "should" do without rooting it in their data

Return:
- summary: 2-3 sentences capturing the shape of the week
- insights: 3-6 patterns or learnings, each one sentence
- adjustments_for_next_week: 3-5 concrete, doable changes`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { client } = getUserClient(req);
    const userId = await requireUserId(client);
    const { week_of } = await req.json();
    if (!week_of) return errorResponse("week_of required", 400);

    const ctx = await loadLifeContext(client, userId, { days: 7, topMemory: 30 });

    // Pull the actual blocks for this week with statuses
    const end = new Date(week_of);
    end.setDate(end.getDate() + 6);
    const endIso = end.toISOString().slice(0, 10);

    const { data: blocks } = await client
      .from("time_blocks")
      .select("date,start_time,category,title,status,intensity")
      .eq("user_id", userId)
      .gte("date", week_of)
      .lte("date", endIso)
      .order("date");

    const userPrompt = [
      lifeContextPrompt(ctx),
      "",
      `## WEEK SCHEDULE & STATUS (week of ${week_of})`,
      JSON.stringify(blocks ?? [], null, 2),
      "",
      `## TASK`,
      `Reflect on the week. Return JSON via the \`reflect_week\` tool.`,
    ].join("\n");

    const result = await claudeStructured<{
      summary: string;
      insights: string[];
      adjustments_for_next_week: string[];
    }>({
      system: SYSTEM,
      user: userPrompt,
      toolName: "reflect_week",
      toolDescription: "Submit the weekly reflection.",
      schema: reflectionOutputSchema,
      maxTokens: 3000,
    });

    await client.from("reflections").upsert(
      {
        user_id: userId,
        week_of,
        summary: result.summary,
        insights: result.insights,
        adjustments_for_next_week: result.adjustments_for_next_week,
      },
      { onConflict: "user_id,week_of" }
    );

    return jsonResponse(result);
  } catch (e) {
    console.error("[weekly-reflection] error", e);
    return errorResponse((e as Error).message, 500);
  }
});
