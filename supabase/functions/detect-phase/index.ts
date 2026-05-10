// deno-lint-ignore-file no-explicit-any
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { getUserClient, requireUserId } from "../_shared/supabase.ts";

// Rule-based phase detection v1. Conservative — only switches with strong
// signal. Easier to extend later with an LLM-driven path.

type Phase =
  | "default"
  | "mass"
  | "fight_camp"
  | "exam_week"
  | "fat_loss"
  | "recovery"
  | "travel";

interface BlockLite {
  date: string;
  category: string;
  title: string | null;
  intensity: number | null;
}

interface CheckinLite {
  date: string;
  sleep_quality: number | null;
  soreness: number | null;
  motivation: number | null;
  stress: number | null;
}

function classify(blocks: BlockLite[], checkins: CheckinLite[]): {
  phase: Phase;
  confidence: number;
  reasoning: string;
} {
  const reasons: string[] = [];

  const counts = {
    bjj: blocks.filter((b) => b.category === "bjj").length,
    fitness: blocks.filter((b) => b.category === "fitness").length,
    study: blocks.filter((b) => b.category === "study").length,
    travel: blocks.filter((b) => b.category === "work" && /travel/i.test(b.title ?? "")).length,
  };

  const text = blocks.map((b) => (b.title ?? "").toLowerCase()).join(" ");
  const hasFightCamp = /weigh|fight|comp|tournament|bracket|cut|camp/.test(text);
  const hasExam = /exam|final|midterm|test/.test(text);

  const sleepAvg =
    checkins.length === 0
      ? 7
      : checkins.reduce((a, c) => a + (c.sleep_quality ?? 5), 0) / checkins.length;
  const stressAvg =
    checkins.length === 0
      ? 4
      : checkins.reduce((a, c) => a + (c.stress ?? 5), 0) / checkins.length;
  const sorenessAvg =
    checkins.length === 0
      ? 4
      : checkins.reduce((a, c) => a + (c.soreness ?? 5), 0) / checkins.length;

  // Travel: many travel-tagged blocks recently
  if (counts.travel >= 3) {
    reasons.push(`${counts.travel} travel-tagged blocks recently`);
    return { phase: "travel", confidence: 80, reasoning: reasons.join("; ") };
  }

  // Fight camp: lots of BJJ + camp/comp signals
  if (counts.bjj >= 5 && hasFightCamp) {
    reasons.push(`${counts.bjj} BJJ sessions + fight/comp signals in titles`);
    return { phase: "fight_camp", confidence: 85, reasoning: reasons.join("; ") };
  }

  // Exam week: spike in study sessions + exam keywords
  if (counts.study >= 8 || (counts.study >= 5 && hasExam)) {
    reasons.push(`${counts.study} study sessions${hasExam ? " + exam keywords" : ""}`);
    return { phase: "exam_week", confidence: hasExam ? 85 : 70, reasoning: reasons.join("; ") };
  }

  // Recovery: poor sleep + high soreness OR very low intensity week
  const totalIntensity =
    blocks.reduce((a, b) => a + (b.intensity ?? 0), 0) / Math.max(1, blocks.length);
  if ((sleepAvg < 5 && sorenessAvg > 6) || totalIntensity < 3) {
    reasons.push(
      `sleep avg ${sleepAvg.toFixed(1)}/10, soreness avg ${sorenessAvg.toFixed(1)}/10, intensity avg ${totalIntensity.toFixed(1)}/10`
    );
    return { phase: "recovery", confidence: 70, reasoning: reasons.join("; ") };
  }

  // High stress sustained — recovery framing
  if (stressAvg > 7) {
    reasons.push(`stress sustained > 7 (${stressAvg.toFixed(1)})`);
    return { phase: "recovery", confidence: 65, reasoning: reasons.join("; ") };
  }

  // Default fallback
  reasons.push("no strong phase signal");
  return { phase: "default", confidence: 60, reasoning: reasons.join("; ") };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { client } = getUserClient(req);
    const { data: u } = await client.auth.getUser();
    if (!u.user) return errorResponse("Unauthorized", 401);
    const userId = u.user.id;

    const since = new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);
    const { data: blocks } = await client
      .from("time_blocks")
      .select("date,category,title,intensity")
      .eq("user_id", userId)
      .gte("date", since);
    const { data: checkins } = await client
      .from("checkins")
      .select("date,sleep_quality,soreness,motivation,stress")
      .eq("user_id", userId)
      .gte("date", since);

    const result = classify(
      (blocks ?? []) as BlockLite[],
      (checkins ?? []) as CheckinLite[]
    );

    return jsonResponse(result);
  } catch (e) {
    console.error("[detect-phase] error", e);
    return errorResponse((e as Error).message, 500);
  }
});
