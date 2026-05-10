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

async function invoke<TReq extends z.ZodTypeAny, TRes extends z.ZodTypeAny>(
  name: string,
  reqSchema: TReq,
  resSchema: TRes,
  body: z.infer<TReq>
): Promise<z.infer<TRes>> {
  const parsed = reqSchema.parse(body);
  const { data, error } = await supabase.functions.invoke(name, { body: parsed });
  if (error) throw new Error(`[${name}] ${error.message}`);
  return resSchema.parse(data);
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
