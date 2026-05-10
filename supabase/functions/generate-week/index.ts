// deno-lint-ignore-file no-explicit-any
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { getUserClient, requireUserId } from "../_shared/supabase.ts";
import { loadLifeContext, lifeContextPrompt } from "../_shared/context.ts";
import { claudeStructured } from "../_shared/claude.ts";
import { generateWeekOutputSchema } from "../_shared/schema.ts";

const SYSTEM = `You are LifeOS — an elite life-design coach who builds fully personalized weekly schedules.

Your job is NOT to make a calendar. Your job is to create a week of TIME BLOCKS where each block answers what + how + why, like a private coach designing the user's life.

When you generate a workout block, include exercises with sets, reps, rest, intensity. When you generate a meal block, include specific foods, quantities, and why this meal fuels what comes next. When you generate a study block, include method (active recall, spaced repetition), steps, and rules (phone away, etc.). When you generate a BJJ block, include technical focus, intensity %, post-session steps. The same level of execution detail must appear in every category.

CRITICAL RULES:
1. Honor fixed commitments — never schedule on top of them.
2. Higher-ranked goals get the best time slots, more frequency, and better recovery placement.
3. Do not stack heavy CNS load (e.g. heavy lower + hard BJJ + long run) on the same day.
4. Use the user's life graph (learned facts) heavily. If a fact says "performs best lifting at 7am", schedule lifts at 7am.
5. The current performance mode reshapes everything — fight_camp emphasizes conditioning + skill, exam_week prioritizes sleep + brain, mass adds volume + carbs, fat_loss emphasizes deficit-friendly choices, recovery deloads everything, travel uses bodyweight options.
6. Cover the WHOLE PERSON: don't only schedule training and study. Include nutrition, recovery, social, hobby, and sleep blocks.
7. Adapt to recent check-ins — if sleep has been bad, lower intensity; if motivation is low, schedule wins early.
8. Each block must have a 'why' that names the human reason, not the literal action.
9. detailed_plan.kind MUST match category: workout↔fitness, study↔study, meal↔nutrition, bjj↔bjj, recovery↔recovery, social↔social, hobby↔hobby, work↔work, sleep↔sleep.
10. NO guilt framing. Never reference past failures negatively. Only forward-looking coaching.

Generate a full 7-day plan starting Monday at the date provided. Aim for 6-12 blocks per day depending on the user's commitments and goals.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { client } = getUserClient(req);
    const userId = await requireUserId(client);
    const { start_date } = await req.json();
    if (!start_date) return errorResponse("start_date required", 400);

    const ctx = await loadLifeContext(client, userId);
    const userPrompt = [
      lifeContextPrompt(ctx),
      "",
      `## TASK`,
      `Generate the week starting ${start_date} (Monday). Return JSON via the \`design_week\` tool.`,
    ].join("\n");

    const result = await claudeStructured<{ blocks: any[]; reasoning?: string }>({
      system: SYSTEM,
      user: userPrompt,
      toolName: "design_week",
      toolDescription: "Submit a fully designed week of time blocks with execution detail.",
      schema: generateWeekOutputSchema,
      maxTokens: 16000,
    });

    const end = new Date(start_date);
    end.setDate(end.getDate() + 6);
    const endIso = end.toISOString().slice(0, 10);
    await client
      .from("time_blocks")
      .delete()
      .eq("user_id", userId)
      .gte("date", start_date)
      .lte("date", endIso)
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

    return jsonResponse({ blocks: result.blocks, reasoning: result.reasoning });
  } catch (e) {
    console.error("[generate-week] error", e);
    return errorResponse((e as Error).message, 500);
  }
});
