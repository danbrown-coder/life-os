import dayjs from "dayjs";
import type { TimeBlock } from "@/lib/db/types";
import { startOfWeekISO } from "@/lib/utils/time";

// Mock week of blocks demonstrating all 9 categories. Used by Today / Week
// before AI generation is wired so the entire UI is real on day 1.

let _id = 0;
const id = () => `mock-${++_id}`;

export function mockWeek(userId = "mock-user"): TimeBlock[] {
  const monday = dayjs(startOfWeekISO());
  const day = (n: number) => monday.add(n, "day").format("YYYY-MM-DD");

  const base = (overrides: Partial<TimeBlock>): TimeBlock => ({
    id: id(),
    user_id: userId,
    date: overrides.date!,
    start_time: overrides.start_time!,
    end_time: overrides.end_time!,
    category: overrides.category!,
    title: overrides.title!,
    why: overrides.why ?? null,
    intensity: overrides.intensity ?? 5,
    priority: overrides.priority ?? 5,
    detailed_plan: overrides.detailed_plan ?? {},
    success_criteria: overrides.success_criteria ?? null,
    status: "planned",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return [
    // ---------- MONDAY: Upper Strength + BJJ ----------
    base({
      date: day(0),
      start_time: "06:00",
      end_time: "06:30",
      category: "nutrition",
      title: "Pre-lift fuel",
      why: "Fast-digesting carbs for explosive output",
      intensity: 2,
      detailed_plan: {
        kind: "meal",
        meal_type: "Pre-lift",
        why: "Fast-digesting carbs for explosive pressing/pulling output.",
        items: [
          { food: "Oats", qty: "80g" },
          { food: "Banana", qty: "1 medium" },
          { food: "Whey isolate", qty: "30g" },
        ],
        hydration: "500ml water + electrolytes",
      },
    }),
    base({
      date: day(0),
      start_time: "07:00",
      end_time: "08:30",
      category: "fitness",
      title: "Upper Strength",
      why: "Maximal pressing/pulling strength",
      intensity: 9,
      priority: 1,
      detailed_plan: {
        kind: "workout",
        goal: "Maximal upper-body force production. No failure on heavy sets.",
        warmup: [
          { name: "Band pull-aparts", sets: "2 × 20" },
          { name: "Pushups", sets: "2 × 10" },
          { name: "Bench bar ramp-up", sets: "3 progressive sets" },
        ],
        exercises: [
          { name: "Bench press", sets: 5, reps: "5", rest_sec: 240, rpe: 8 },
          { name: "Weighted pull-ups", sets: 5, reps: "5", rest_sec: 180, rpe: 8 },
          { name: "OHP", sets: 4, reps: "6", rest_sec: 150, rpe: 7 },
          { name: "Barbell row", sets: 4, reps: "8", rest_sec: 120, rpe: 7 },
          { name: "Incline DB press", sets: 3, reps: "10", rest_sec: 90 },
          { name: "Curls + triceps superset", sets: 3, reps: "10", rest_sec: 60 },
        ],
        rules: ["Stop if bar speed dies", "No failure on heavy compounds", "3–5 min rest on big lifts"],
        nutrition_notes: "High carb meal within 60 min after.",
      },
      success_criteria: ["All top sets at RPE ≤8", "Bar speed maintained on bench"],
    }),
    base({
      date: day(0),
      start_time: "10:30",
      end_time: "12:00",
      category: "study",
      title: "Deep Work — Physics PSet",
      why: "Best focus window post-lift, pre-lunch",
      intensity: 7,
      priority: 2,
      detailed_plan: {
        kind: "study",
        goal: "Finish PSet 4 problems 1-6.",
        task: "Physics PSet 4",
        method: ["active recall", "no rereading without solving"],
        steps: [
          { duration_min: 10, description: "Skim relevant lecture notes." },
          { duration_min: 60, description: "Solve problems 1-6 without notes first." },
          { duration_min: 15, description: "Check answers, mark sticking points." },
          { duration_min: 5, description: "Write 1-2 questions for office hours." },
        ],
        rules: ["Phone in another room", "No music with lyrics", "Stand up every 25 min"],
      },
      success_criteria: ["6/6 problems attempted", "≥4/6 fully correct"],
    }),
    base({
      date: day(0),
      start_time: "17:00",
      end_time: "18:30",
      category: "bjj",
      title: "BJJ — Technical Rolling",
      why: "Skill above intensity today; legs already taxed",
      intensity: 6,
      priority: 1,
      detailed_plan: {
        kind: "bjj",
        goal: "Technical progression on guard retention.",
        focus: ["guard retention", "frame escapes", "positional sparring"],
        intensity_pct: 70,
        rules: ["No ego rolling", "Avoid max-effort rounds — lower body fatigued from lift"],
        post_session: ["Carbs + protein within 60 min", "Stretch hips and neck", "Log 1 thing learned"],
      },
    }),
    base({
      date: day(0),
      start_time: "19:30",
      end_time: "20:15",
      category: "nutrition",
      title: "Post-BJJ Dinner",
      why: "Replenish glycogen, repair, hydrate",
      detailed_plan: {
        kind: "meal",
        meal_type: "Post-BJJ Dinner",
        why: "Aggressive glycogen restoration after a high-volume day.",
        items: [
          { food: "Rice", qty: "1.5 cups cooked" },
          { food: "Chicken or salmon", qty: "8oz" },
          { food: "Sautéed greens", qty: "1 cup" },
          { food: "Salt", qty: "pinch — sodium loss is real" },
        ],
        hydration: "750ml + electrolytes",
        alternatives: [
          {
            context: "Dining hall",
            items: [
              { food: "Pasta + tomato sauce", qty: "large" },
              { food: "Grilled chicken", qty: "2 servings" },
            ],
          },
        ],
      },
    }),
    base({
      date: day(0),
      start_time: "22:00",
      end_time: "22:30",
      category: "recovery",
      title: "Wind-down",
      detailed_plan: {
        kind: "recovery",
        type: "Sleep prep",
        steps: [
          "Phone on Do Not Disturb",
          "5 min hip and neck mobility",
          "Magnesium glycinate",
          "Read fiction 10 min",
        ],
      },
    }),
    base({
      date: day(0),
      start_time: "22:30",
      end_time: "06:00",
      category: "sleep",
      title: "Sleep",
      detailed_plan: {
        kind: "sleep",
        target_hours: 8,
        pre_sleep_steps: ["Cool room", "Blackout curtains", "No screens last 30 min"],
        notes: "Hard upper day + BJJ — protect this.",
      },
    }),

    // ---------- TUESDAY: Recovery, study, social ----------
    base({
      date: day(1),
      start_time: "07:00",
      end_time: "07:45",
      category: "recovery",
      title: "Easy walk + mobility",
      detailed_plan: {
        kind: "recovery",
        type: "Active recovery walk",
        steps: ["30 min easy zone-2 walk outside", "10 min hip + thoracic mobility", "Sunlight in eyes"],
        notes: "Day after upper + BJJ — flush, don't stress.",
      },
    }),
    base({
      date: day(1),
      start_time: "09:00",
      end_time: "11:30",
      category: "study",
      title: "Deep Work — Org Chem",
      detailed_plan: {
        kind: "study",
        goal: "Finish reaction mechanism flashcards for Ch 7.",
        task: "Org chem ch 7 mechanisms",
        method: ["active recall", "spaced repetition", "feynman technique"],
        steps: [
          { duration_min: 25, description: "Review existing Anki cards." },
          { duration_min: 60, description: "Make new cards from sticking points." },
          { duration_min: 30, description: "Drill weak cards — out loud." },
          { duration_min: 15, description: "Write 3 'why' questions for tutor." },
        ],
        rules: ["No phone", "No tab switching"],
      },
    }),
    base({
      date: day(1),
      start_time: "19:00",
      end_time: "21:00",
      category: "social",
      title: "Dinner with friends",
      why: "Low social interaction last week — recharge socially",
      detailed_plan: {
        kind: "social",
        intention: "Genuine connection, not networking. Be present.",
        with_whom: "Close friends",
        energy_required: "med",
        notes: "Phone face-down on the table.",
      },
    }),

    // ---------- WEDNESDAY: Lower Strength ----------
    base({
      date: day(2),
      start_time: "07:00",
      end_time: "08:30",
      category: "fitness",
      title: "Lower Strength",
      intensity: 9,
      priority: 1,
      detailed_plan: {
        kind: "workout",
        goal: "Heavy posterior chain. Squat + DL focus.",
        warmup: [
          { name: "Goblet squats", sets: "2 × 10" },
          { name: "Glute bridges", sets: "2 × 12" },
          { name: "Bar ramp-up", sets: "3 sets" },
        ],
        exercises: [
          { name: "Back squat", sets: 5, reps: "5", rest_sec: 240, rpe: 8 },
          { name: "Romanian deadlift", sets: 4, reps: "6", rest_sec: 180 },
          { name: "Walking lunges", sets: 3, reps: "10/side", rest_sec: 120 },
          { name: "Leg curls", sets: 3, reps: "12", rest_sec: 90 },
          { name: "Calf raises", sets: 4, reps: "12", rest_sec: 60 },
        ],
        rules: ["No squatting through knee pain", "Stop if form breaks down"],
      },
    }),
    base({
      date: day(2),
      start_time: "14:00",
      end_time: "15:30",
      category: "work",
      title: "Deep Work — Project",
      detailed_plan: {
        kind: "work",
        goal: "Ship draft of v0 spec.",
        focus_block: "deep work",
        tasks: ["Write user flows", "Sketch data model", "Send to mentor"],
        rules: ["No Slack", "No email"],
      },
    }),

    // ---------- THURSDAY: Hobby + study + BJJ ----------
    base({
      date: day(3),
      start_time: "08:00",
      end_time: "09:00",
      category: "hobby",
      title: "Guitar practice",
      detailed_plan: {
        kind: "hobby",
        hobby: "Guitar",
        goal: "Clean run of fingerpicking pattern at 90 BPM.",
        steps: ["10 min warmup chromatics", "30 min loop the hard bar", "20 min play for fun"],
      },
    }),
    base({
      date: day(3),
      start_time: "17:00",
      end_time: "18:30",
      category: "bjj",
      title: "BJJ — Hard rounds",
      intensity: 9,
      detailed_plan: {
        kind: "bjj",
        goal: "Live rounds — push pace.",
        focus: ["pressure passing", "back takes"],
        intensity_pct: 90,
        rules: ["Tap early, tap often", "Find new partners"],
        post_session: ["Cold shower", "High carb dinner"],
      },
    }),

    // ---------- FRIDAY: Conditioning + light ----------
    base({
      date: day(4),
      start_time: "07:00",
      end_time: "07:45",
      category: "fitness",
      title: "Zone 2 conditioning",
      intensity: 5,
      detailed_plan: {
        kind: "workout",
        goal: "Aerobic base. Easy enough to nose-breathe.",
        warmup: [{ name: "Walk", sets: "5 min" }],
        exercises: [{ name: "Easy run / bike", sets: 1, reps: "35 min @ Z2 HR", rest_sec: 0 }],
        rules: ["If you can't nose-breathe, slow down"],
      },
    }),

    // ---------- SATURDAY: Long social, hobby, easy ----------
    base({
      date: day(5),
      start_time: "10:00",
      end_time: "12:00",
      category: "hobby",
      title: "Climb / outdoor",
      detailed_plan: {
        kind: "hobby",
        hobby: "Bouldering",
        goal: "Have fun. Push grade once warmed up.",
        steps: ["Warmup easy laps", "Project session", "Cool down on jugs"],
      },
    }),

    // ---------- SUNDAY: Reflect + prep ----------
    base({
      date: day(6),
      start_time: "09:00",
      end_time: "10:00",
      category: "recovery",
      title: "Weekly reflection + plan next week",
      detailed_plan: {
        kind: "recovery",
        type: "Reflection",
        steps: [
          "Review last week's executions",
          "Note what worked and what didn't",
          "Set top 3 priorities for the week",
        ],
      },
    }),
  ];
}
