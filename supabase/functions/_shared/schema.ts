// JSON Schemas mirroring lib/ai/schemas.ts for use as Claude tool inputs.

export const detailedPlanSchema = {
  oneOf: [
    {
      type: "object",
      required: ["kind", "goal", "exercises"],
      properties: {
        kind: { const: "workout" },
        goal: { type: "string" },
        warmup: {
          type: "array",
          items: {
            type: "object",
            required: ["name"],
            properties: { name: { type: "string" }, sets: { type: "string" } },
          },
        },
        exercises: {
          type: "array",
          items: {
            type: "object",
            required: ["name", "sets", "reps"],
            properties: {
              name: { type: "string" },
              sets: { type: "integer" },
              reps: { type: "string" },
              rest_sec: { type: "integer" },
              rpe: { type: "number" },
              notes: { type: "string" },
            },
          },
        },
        cooldown: { type: "array", items: { type: "string" } },
        rules: { type: "array", items: { type: "string" } },
        nutrition_notes: { type: "string" },
      },
    },
    {
      type: "object",
      required: ["kind", "goal", "task", "steps"],
      properties: {
        kind: { const: "study" },
        goal: { type: "string" },
        task: { type: "string" },
        method: { type: "array", items: { type: "string" } },
        steps: {
          type: "array",
          items: {
            type: "object",
            required: ["duration_min", "description"],
            properties: {
              duration_min: { type: "integer" },
              description: { type: "string" },
            },
          },
        },
        rules: { type: "array", items: { type: "string" } },
      },
    },
    {
      type: "object",
      required: ["kind", "meal_type", "why", "items"],
      properties: {
        kind: { const: "meal" },
        meal_type: { type: "string" },
        why: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["food", "qty"],
            properties: {
              food: { type: "string" },
              qty: { type: "string" },
              notes: { type: "string" },
            },
          },
        },
        hydration: { type: "string" },
        alternatives: {
          type: "array",
          items: {
            type: "object",
            properties: {
              context: { type: "string" },
              items: { type: "array", items: { type: "object" } },
            },
          },
        },
      },
    },
    {
      type: "object",
      required: ["kind", "goal", "focus", "intensity_pct"],
      properties: {
        kind: { const: "bjj" },
        goal: { type: "string" },
        focus: { type: "array", items: { type: "string" } },
        intensity_pct: { type: "integer" },
        rules: { type: "array", items: { type: "string" } },
        post_session: { type: "array", items: { type: "string" } },
      },
    },
    {
      type: "object",
      required: ["kind", "type", "steps"],
      properties: {
        kind: { const: "recovery" },
        type: { type: "string" },
        steps: { type: "array", items: { type: "string" } },
        notes: { type: "string" },
      },
    },
    {
      type: "object",
      required: ["kind", "intention"],
      properties: {
        kind: { const: "social" },
        intention: { type: "string" },
        with_whom: { type: "string" },
        energy_required: { enum: ["low", "med", "high"] },
        notes: { type: "string" },
      },
    },
    {
      type: "object",
      required: ["kind", "hobby", "goal"],
      properties: {
        kind: { const: "hobby" },
        hobby: { type: "string" },
        goal: { type: "string" },
        steps: { type: "array", items: { type: "string" } },
      },
    },
    {
      type: "object",
      required: ["kind", "goal", "focus_block"],
      properties: {
        kind: { const: "work" },
        goal: { type: "string" },
        focus_block: { type: "string" },
        tasks: { type: "array", items: { type: "string" } },
        rules: { type: "array", items: { type: "string" } },
      },
    },
    {
      type: "object",
      required: ["kind", "target_hours"],
      properties: {
        kind: { const: "sleep" },
        target_hours: { type: "number" },
        pre_sleep_steps: { type: "array", items: { type: "string" } },
        notes: { type: "string" },
      },
    },
  ],
};

export const blockSchema = {
  type: "object",
  required: ["date", "start_time", "end_time", "category", "title", "detailed_plan"],
  properties: {
    date: { type: "string", description: "ISO YYYY-MM-DD" },
    start_time: { type: "string", description: "HH:mm 24h" },
    end_time: { type: "string" },
    category: {
      enum: [
        "fitness",
        "nutrition",
        "study",
        "bjj",
        "recovery",
        "social",
        "hobby",
        "work",
        "sleep",
      ],
    },
    title: { type: "string" },
    why: { type: "string" },
    intensity: { type: "integer", minimum: 0, maximum: 10 },
    priority: { type: "integer", minimum: 1, maximum: 10 },
    detailed_plan: detailedPlanSchema,
    success_criteria: { type: "array", items: { type: "string" } },
  },
};

export const generateWeekOutputSchema = {
  type: "object",
  required: ["blocks"],
  properties: {
    blocks: { type: "array", items: blockSchema, minItems: 5 },
    reasoning: { type: "string" },
  },
};

export const adjustDayOutputSchema = {
  type: "object",
  required: ["blocks", "diff_summary"],
  properties: {
    blocks: { type: "array", items: blockSchema },
    diff_summary: { type: "string" },
  },
};

export const memoryFactsOutputSchema = {
  type: "object",
  required: ["facts"],
  properties: {
    facts: {
      type: "array",
      items: {
        type: "object",
        required: ["fact"],
        properties: {
          domain: {
            enum: [
              "fitness",
              "nutrition",
              "study",
              "bjj",
              "recovery",
              "social",
              "hobby",
              "work",
              "sleep",
            ],
          },
          fact: { type: "string" },
          confidence: { type: "integer", minimum: 0, maximum: 100 },
          source: { type: "string" },
          evidence: { type: "object" },
        },
      },
    },
  },
};

export const reflectionOutputSchema = {
  type: "object",
  required: ["summary", "insights", "adjustments_for_next_week"],
  properties: {
    summary: { type: "string" },
    insights: { type: "array", items: { type: "string" } },
    adjustments_for_next_week: { type: "array", items: { type: "string" } },
  },
};

export const detectPhaseOutputSchema = {
  type: "object",
  required: ["phase", "confidence", "reasoning"],
  properties: {
    phase: {
      enum: ["default", "mass", "fight_camp", "exam_week", "fat_loss", "recovery", "travel"],
    },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
    reasoning: { type: "string" },
  },
};
