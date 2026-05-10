// Hand-written types. Replace with generated types via:
//   npm run supabase:types
// once your local Supabase is running. Keep the same shape so code keeps working.

export type DomainCategory =
  | "fitness"
  | "nutrition"
  | "study"
  | "bjj"
  | "recovery"
  | "social"
  | "hobby"
  | "work"
  | "sleep";

export type PerformanceMode =
  | "default"
  | "mass"
  | "fight_camp"
  | "exam_week"
  | "fat_loss"
  | "recovery"
  | "travel";

export type BlockStatus = "planned" | "completed" | "skipped" | "modified";

export interface Profile {
  id: string;
  display_name: string | null;
  wake_time: string | null;
  sleep_time: string | null;
  timezone: string;
  current_phase: PerformanceMode;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  category: DomainCategory;
  title: string;
  description: string | null;
  priority: number;
  target_date: string | null;
  current_level: string | null;
  active: boolean;
  created_at: string;
}

export interface UserConstraint {
  id: string;
  user_id: string;
  type: string;
  description: string;
  active: boolean;
  created_at: string;
}

export interface Commitment {
  id: string;
  user_id: string;
  title: string;
  category: DomainCategory | null;
  rrule: string | null;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export interface TimeBlock {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  category: DomainCategory;
  title: string;
  why: string | null;
  intensity: number | null;
  priority: number | null;
  detailed_plan: Record<string, unknown>;
  success_criteria: string[] | null;
  status: BlockStatus;
  created_at: string;
  updated_at: string;
}

export interface Checkin {
  id: string;
  user_id: string;
  date: string;
  sleep_quality: number | null;
  soreness: number | null;
  motivation: number | null;
  stress: number | null;
  time_available_min: number | null;
  notes: string | null;
  created_at: string;
}

export interface Execution {
  id: string;
  block_id: string;
  user_id: string;
  completed: boolean | null;
  modifications: string | null;
  reality: Record<string, unknown>;
  reflection: string | null;
  created_at: string;
}

export interface MemoryFact {
  id: string;
  user_id: string;
  domain: DomainCategory | null;
  fact: string;
  confidence: number;
  source: string | null;
  evidence: Record<string, unknown>;
  user_confirmed: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LifePhase {
  id: string;
  user_id: string;
  phase: PerformanceMode;
  started_on: string;
  ended_on: string | null;
  detected_via: string | null;
  notes: string | null;
  created_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  week_of: string;
  summary: string | null;
  insights: string[] | null;
  adjustments_for_next_week: string[] | null;
  created_at: string;
}
