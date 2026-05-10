import { z } from "zod";
import { supabase } from "@/lib/supabase";
import {
  GenerateWeekRequestZ,
  GenerateWeekResponseZ,
  AdjustDayRequestZ,
  AdjustDayResponseZ,
  ExtractMemoryRequestZ,
  ExtractMemoryResponseZ,
  WeeklyReflectionRequestZ,
  WeeklyReflectionResponseZ,
  DetectPhaseRequestZ,
  DetectPhaseResponseZ,
} from "./schemas";

// Subclass of Error that carries the raw edge-function response, so a UI
// debug pane can render exactly what came back when the Zod schema rejected.
export class AiResponseValidationError extends Error {
  readonly fnName: string;
  readonly raw: unknown;
  readonly issues: z.ZodIssue[];

  constructor(fnName: string, raw: unknown, issues: z.ZodIssue[]) {
    const summary = issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    super(`[${fnName}] AI response failed validation: ${summary}`);
    this.name = "AiResponseValidationError";
    this.fnName = fnName;
    this.raw = raw;
    this.issues = issues;
  }
}

async function invoke<TReq extends z.ZodTypeAny, TRes extends z.ZodTypeAny>(
  name: string,
  reqSchema: TReq,
  resSchema: TRes,
  body: z.infer<TReq>
): Promise<z.infer<TRes>> {
  const parsed = reqSchema.parse(body);
  const { data, error } = await supabase.functions.invoke(name, { body: parsed });
  if (error) throw new Error(`[${name}] ${error.message}`);

  const result = resSchema.safeParse(data);
  if (!result.success) {
    if (typeof console !== "undefined") {
      console.error(
        `[lifeos] ${name} response failed validation`,
        "\n  issues:",
        result.error.issues,
        "\n  raw response:",
        data
      );
    }
    throw new AiResponseValidationError(name, data, result.error.issues);
  }
  return result.data;
}

export const aiClient = {
  generateWeek: (start_date: string) =>
    invoke("generate-week", GenerateWeekRequestZ, GenerateWeekResponseZ, { start_date }),

  adjustDay: (req: z.infer<typeof AdjustDayRequestZ>) =>
    invoke("adjust-day", AdjustDayRequestZ, AdjustDayResponseZ, req),

  extractMemory: (date: string) =>
    invoke("extract-memory", ExtractMemoryRequestZ, ExtractMemoryResponseZ, { date }),

  weeklyReflection: (week_of: string) =>
    invoke("weekly-reflection", WeeklyReflectionRequestZ, WeeklyReflectionResponseZ, { week_of }),

  detectPhase: () =>
    invoke("detect-phase", DetectPhaseRequestZ, DetectPhaseResponseZ, {}),
};
