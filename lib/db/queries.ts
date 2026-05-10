import { supabase } from "../supabase";
import type {
  Checkin,
  Commitment,
  Execution,
  Goal,
  LifePhase,
  MemoryFact,
  PerformanceMode,
  Profile,
  Reflection,
  TimeBlock,
  UserConstraint,
} from "./types";

// ---------------------------------------------------------------------------
// profile
// ---------------------------------------------------------------------------

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(userId: string, patch: Partial<Profile>) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

export async function setPhase(userId: string, phase: PerformanceMode) {
  const today = new Date().toISOString().slice(0, 10);
  await supabase.from("life_phases").update({ ended_on: today }).eq("user_id", userId).is("ended_on", null);
  await supabase.from("life_phases").insert({ user_id: userId, phase, started_on: today, detected_via: "user-set" });
  await updateProfile(userId, { current_phase: phase });
}

// ---------------------------------------------------------------------------
// goals + constraints + commitments
// ---------------------------------------------------------------------------

export async function listGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("priority");
  if (error) throw error;
  return (data ?? []) as Goal[];
}

export async function upsertGoal(g: Partial<Goal> & { user_id: string; category: Goal["category"]; title: string; priority: number }) {
  const { error } = await supabase.from("goals").upsert(g);
  if (error) throw error;
}

export async function listConstraints(userId: string): Promise<UserConstraint[]> {
  const { data, error } = await supabase
    .from("user_constraints")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true);
  if (error) throw error;
  return (data ?? []) as UserConstraint[];
}

export async function listCommitments(userId: string): Promise<Commitment[]> {
  const { data, error } = await supabase
    .from("commitments")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true);
  if (error) throw error;
  return (data ?? []) as Commitment[];
}

// ---------------------------------------------------------------------------
// time blocks
// ---------------------------------------------------------------------------

export async function getBlocksForDate(userId: string, date: string): Promise<TimeBlock[]> {
  const { data, error } = await supabase
    .from("time_blocks")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .order("start_time");
  if (error) throw error;
  return (data ?? []) as TimeBlock[];
}

export async function getBlocksForWeek(userId: string, startDate: string, endDate: string): Promise<TimeBlock[]> {
  const { data, error } = await supabase
    .from("time_blocks")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date")
    .order("start_time");
  if (error) throw error;
  return (data ?? []) as TimeBlock[];
}

export async function getBlock(blockId: string): Promise<TimeBlock | null> {
  const { data, error } = await supabase
    .from("time_blocks")
    .select("*")
    .eq("id", blockId)
    .maybeSingle();
  if (error) throw error;
  return data as TimeBlock | null;
}

export async function updateBlockStatus(blockId: string, status: TimeBlock["status"]) {
  const { error } = await supabase.from("time_blocks").update({ status }).eq("id", blockId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// check-ins + executions
// ---------------------------------------------------------------------------

export async function upsertCheckin(c: Omit<Checkin, "id" | "created_at">) {
  const { error } = await supabase.from("checkins").upsert(c, { onConflict: "user_id,date" });
  if (error) throw error;
}

export async function getCheckin(userId: string, date: string): Promise<Checkin | null> {
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return data as Checkin | null;
}

export async function recordExecution(e: Omit<Execution, "id" | "created_at">) {
  const { error } = await supabase.from("executions").insert(e);
  if (error) throw error;
}

export async function recentExecutions(userId: string, days: number): Promise<Execution[]> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("executions")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Execution[];
}

// ---------------------------------------------------------------------------
// memory facts (the moat)
// ---------------------------------------------------------------------------

export async function listMemory(userId: string): Promise<MemoryFact[]> {
  const { data, error } = await supabase
    .from("memory_facts")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("confidence", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MemoryFact[];
}

export async function setMemoryConfirmed(id: string, confirmed: boolean) {
  const { error } = await supabase
    .from("memory_facts")
    .update({ user_confirmed: confirmed, confidence: confirmed ? 100 : 50 })
    .eq("id", id);
  if (error) throw error;
}

export async function deactivateMemory(id: string) {
  const { error } = await supabase.from("memory_facts").update({ active: false }).eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// life phases + reflections
// ---------------------------------------------------------------------------

export async function currentPhase(userId: string): Promise<LifePhase | null> {
  const { data, error } = await supabase
    .from("life_phases")
    .select("*")
    .eq("user_id", userId)
    .is("ended_on", null)
    .order("started_on", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as LifePhase | null;
}

export async function latestReflection(userId: string): Promise<Reflection | null> {
  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .eq("user_id", userId)
    .order("week_of", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Reflection | null;
}
