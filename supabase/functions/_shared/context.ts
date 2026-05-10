// deno-lint-ignore-file no-explicit-any
// Builds the "life graph" context payload that gets injected into every
// Claude prompt. This is the personalization moat: the more memory_facts
// accumulate, the smarter every generation gets.

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface LifeContext {
  profile: any;
  goals: any[];
  constraints: any[];
  commitments: any[];
  current_phase: string;
  recent_checkins: any[];
  recent_executions: any[];
  memory_facts: any[];
}

export async function loadLifeContext(
  client: SupabaseClient,
  userId: string,
  opts: { days?: number; topMemory?: number } = {}
): Promise<LifeContext> {
  const days = opts.days ?? 7;
  const topMemory = opts.topMemory ?? 30;
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const [
    { data: profile },
    { data: goals },
    { data: constraints },
    { data: commitments },
    { data: phase },
    { data: checkins },
    { data: executions },
    { data: memory },
  ] = await Promise.all([
    client.from("profiles").select("*").eq("id", userId).maybeSingle(),
    client
      .from("goals")
      .select("category,title,description,priority,target_date,current_level")
      .eq("user_id", userId)
      .eq("active", true)
      .order("priority"),
    client
      .from("user_constraints")
      .select("type,description")
      .eq("user_id", userId)
      .eq("active", true),
    client
      .from("commitments")
      .select("title,category,rrule,start_time,end_time,notes")
      .eq("user_id", userId)
      .eq("active", true),
    client
      .from("life_phases")
      .select("phase")
      .eq("user_id", userId)
      .is("ended_on", null)
      .order("started_on", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from("checkins")
      .select("date,sleep_quality,soreness,motivation,stress,time_available_min,notes")
      .eq("user_id", userId)
      .gte("date", since.slice(0, 10))
      .order("date", { ascending: false }),
    client
      .from("executions")
      .select("block_id,completed,modifications,reality,reflection,created_at")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false }),
    client
      .from("memory_facts")
      .select("domain,fact,confidence,user_confirmed,source,evidence")
      .eq("user_id", userId)
      .eq("active", true)
      .order("confidence", { ascending: false })
      .limit(topMemory),
  ]);

  return {
    profile: profile ?? {},
    goals: goals ?? [],
    constraints: constraints ?? [],
    commitments: commitments ?? [],
    current_phase: phase?.phase ?? profile?.current_phase ?? "default",
    recent_checkins: checkins ?? [],
    recent_executions: executions ?? [],
    memory_facts: memory ?? [],
  };
}

// Convert the context into a compact text block to inject into prompts.
// Claude handles JSON well, but a structured English block is more
// instruction-following-friendly for coaching reasoning.
export function lifeContextPrompt(ctx: LifeContext): string {
  const out: string[] = [];
  out.push("## USER LIFE GRAPH");
  out.push(
    `Profile: name=${ctx.profile?.display_name ?? "(unset)"}, wake=${ctx.profile?.wake_time ?? "?"}, sleep=${ctx.profile?.sleep_time ?? "?"}, tz=${ctx.profile?.timezone ?? "UTC"}`
  );
  out.push(`Current performance mode: ${ctx.current_phase}`);

  if (ctx.goals.length > 0) {
    out.push("\nRanked goals (1 = highest priority):");
    for (const g of ctx.goals) {
      out.push(
        `  ${g.priority}. [${g.category}] ${g.title}${g.current_level ? ` — currently: ${g.current_level}` : ""}${g.target_date ? ` (target ${g.target_date})` : ""}`
      );
    }
  }

  if (ctx.constraints.length > 0) {
    out.push("\nConstraints:");
    for (const c of ctx.constraints) out.push(`  - [${c.type}] ${c.description}`);
  }

  if (ctx.commitments.length > 0) {
    out.push("\nFixed commitments (don't move these):");
    for (const c of ctx.commitments) {
      out.push(
        `  - ${c.title} (${c.category ?? "general"}) ${c.start_time ?? ""}-${c.end_time ?? ""}${c.rrule ? ` ${c.rrule}` : ""}`
      );
    }
  }

  if (ctx.memory_facts.length > 0) {
    out.push("\nLearned facts about this user (THE LIFE GRAPH — use these heavily):");
    for (const f of ctx.memory_facts) {
      const tag = f.user_confirmed ? "[CONFIRMED]" : `[${f.confidence}%]`;
      out.push(`  ${tag} (${f.domain ?? "general"}) ${f.fact}`);
    }
  }

  if (ctx.recent_checkins.length > 0) {
    out.push("\nRecent daily check-ins (most recent first):");
    for (const c of ctx.recent_checkins.slice(0, 7)) {
      out.push(
        `  ${c.date}: sleep=${c.sleep_quality}, sore=${c.soreness}, mot=${c.motivation}, stress=${c.stress}${c.notes ? ` "${c.notes}"` : ""}`
      );
    }
  }

  if (ctx.recent_executions.length > 0) {
    out.push("\nRecent executions (planned vs reality):");
    for (const e of ctx.recent_executions.slice(0, 15)) {
      out.push(
        `  ${e.created_at?.slice(0, 10) ?? ""} completed=${e.completed}${e.modifications ? ` mods="${e.modifications}"` : ""}`
      );
    }
  }

  return out.join("\n");
}
