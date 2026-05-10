import { z } from "zod";

// ===========================================================================
// Domain primitives
// ===========================================================================

export const DomainCategoryZ = z.enum([
  "fitness",
  "nutrition",
  "study",
  "bjj",
  "recovery",
  "social",
  "hobby",
  "work",
  "sleep",
]);
export type DomainCategoryT = z.infer<typeof DomainCategoryZ>;

export const PerformanceModeZ = z.enum([
  "default",
  "mass",
  "fight_camp",
  "exam_week",
  "fat_loss",
  "recovery",
  "travel",
]);
export type PerformanceModeT = z.infer<typeof PerformanceModeZ>;

// ===========================================================================
// Category-specific detailed_plan shapes
// (the difference between "block" and "execution coaching")
// ===========================================================================

export const WorkoutPlanZ = z.object({
  kind: z.literal("workout"),
  goal: z.string(),
  warmup: z.array(z.object({ name: z.string(), sets: z.string().optional() })).default([]),
  exercises: z.array(
    z.object({
      name: z.string(),
      sets: z.number().int(),
      reps: z.string(), // "5", "5-8", "AMRAP"
      rest_sec: z.number().int().default(120),
      rpe: z.number().min(1).max(10).optional(),
      notes: z.string().optional(),
    })
  ),
  cooldown: z.array(z.string()).optional(),
  rules: z.array(z.string()).default([]),
  nutrition_notes: z.string().optional(),
});

export const StudyPlanZ = z.object({
  kind: z.literal("study"),
  goal: z.string(),
  task: z.string(),
  method: z.array(z.string()).default([]), // ["active recall", "spaced repetition"]
  steps: z.array(z.object({ duration_min: z.number().int(), description: z.string() })),
  rules: z.array(z.string()).default([]),
});

export const MealItemZ = z.object({
  food: z.string(),
  qty: z.string(),
  notes: z.string().optional(),
});

export const MealPlanZ = z.object({
  kind: z.literal("meal"),
  meal_type: z.string(), // "pre-lift", "breakfast", "post-bjj", "sleep snack"
  why: z.string(),
  items: z.array(MealItemZ),
  hydration: z.string().optional(),
  alternatives: z
    .array(
      z.object({
        context: z.string(), // "dining hall", "fast option", "restaurant"
        items: z.array(MealItemZ),
      })
    )
    .optional(),
});

export const BjjPlanZ = z.object({
  kind: z.literal("bjj"),
  goal: z.string(),
  focus: z.array(z.string()).default([]),
  intensity_pct: z.number().min(0).max(100).default(70),
  rules: z.array(z.string()).default([]),
  post_session: z.array(z.string()).default([]),
});

export const RecoveryPlanZ = z.object({
  kind: z.literal("recovery"),
  type: z.string(), // "sleep prep", "walk", "mobility", "sauna"
  steps: z.array(z.string()),
  notes: z.string().optional(),
});

export const SocialPlanZ = z.object({
  kind: z.literal("social"),
  intention: z.string(),
  with_whom: z.string().optional(),
  energy_required: z.enum(["low", "med", "high"]).default("med"),
  notes: z.string().optional(),
});

export const HobbyPlanZ = z.object({
  kind: z.literal("hobby"),
  hobby: z.string(),
  goal: z.string(),
  steps: z.array(z.string()).default([]),
});

export const WorkPlanZ = z.object({
  kind: z.literal("work"),
  goal: z.string(),
  focus_block: z.string(), // "deep work", "shallow", "meeting"
  tasks: z.array(z.string()).default([]),
  rules: z.array(z.string()).default([]),
});

export const SleepPlanZ = z.object({
  kind: z.literal("sleep"),
  target_hours: z.number().min(4).max(12).default(8),
  pre_sleep_steps: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const DetailedPlanZ = z.discriminatedUnion("kind", [
  WorkoutPlanZ,
  StudyPlanZ,
  MealPlanZ,
  BjjPlanZ,
  RecoveryPlanZ,
  SocialPlanZ,
  HobbyPlanZ,
  WorkPlanZ,
  SleepPlanZ,
]);

export type DetailedPlanT = z.infer<typeof DetailedPlanZ>;

// ===========================================================================
// Time block (AI-generated)
// ===========================================================================

export const TimeBlockZ = z.object({
  date: z.string(), // ISO yyyy-mm-dd
  start_time: z.string(), // HH:mm
  end_time: z.string(),
  category: DomainCategoryZ,
  title: z.string(),
  why: z.string().optional(),
  intensity: z.number().int().min(0).max(10).optional(),
  priority: z.number().int().min(1).max(10).optional(),
  detailed_plan: DetailedPlanZ,
  success_criteria: z.array(z.string()).default([]),
});

export type TimeBlockT = z.infer<typeof TimeBlockZ>;

// ===========================================================================
// Edge function I/O
// ===========================================================================

export const GenerateWeekRequestZ = z.object({
  start_date: z.string(), // Monday ISO
});

export const GenerateWeekResponseZ = z.object({
  blocks: z.array(TimeBlockZ),
  reasoning: z.string().optional(),
});

export const AdjustDayRequestZ = z.object({
  date: z.string(),
  override: z.string(), // free text
  chips: z.array(z.string()).default([]), // ["slept badly", "sore", "busy", "sick", "traveling"]
});

export const AdjustDayResponseZ = z.object({
  blocks: z.array(TimeBlockZ),
  diff_summary: z.string(),
});

export const ExtractMemoryRequestZ = z.object({
  date: z.string(), // day to learn from
});

export const MemoryFactZ = z.object({
  domain: DomainCategoryZ.optional(),
  fact: z.string(),
  confidence: z.number().min(0).max(100).default(50),
  source: z.string().default("inferred"),
  evidence: z.record(z.unknown()).optional(),
});

export const ExtractMemoryResponseZ = z.object({
  facts: z.array(MemoryFactZ),
});

export const WeeklyReflectionRequestZ = z.object({
  week_of: z.string(), // Monday ISO
});

export const WeeklyReflectionResponseZ = z.object({
  summary: z.string(),
  insights: z.array(z.string()),
  adjustments_for_next_week: z.array(z.string()),
});

export const DetectPhaseRequestZ = z.object({});
export const DetectPhaseResponseZ = z.object({
  phase: PerformanceModeZ,
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
});
