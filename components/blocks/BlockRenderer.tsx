import { Text, View } from "react-native";
import { z } from "zod";
import { DetailedPlanZ } from "@/lib/ai/schemas";
import { WorkoutBlock } from "./WorkoutBlock";
import { StudyBlock } from "./StudyBlock";
import { MealBlock } from "./MealBlock";
import { BjjBlock } from "./BjjBlock";
import { RecoveryBlock } from "./RecoveryBlock";
import { SocialBlock } from "./SocialBlock";
import { HobbyBlock } from "./HobbyBlock";
import { WorkBlock } from "./WorkBlock";
import { SleepBlock } from "./SleepBlock";

// Renders the right component based on plan.kind. Defensive: if the plan
// fails Zod validation, fall back to a generic JSON dump.
export function BlockRenderer({ plan }: { plan: unknown }) {
  const parsed = DetailedPlanZ.safeParse(plan);
  if (!parsed.success) {
    return (
      <View className="border-y border-rule py-4">
        <Text
          className="font-mono uppercase text-bone-500 mb-2"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          RAW PLAN
        </Text>
        <Text className="font-mono text-bone-300" style={{ fontSize: 12 }}>
          {JSON.stringify(plan, null, 2)}
        </Text>
      </View>
    );
  }
  const p = parsed.data;
  switch (p.kind) {
    case "workout":
      return <WorkoutBlock plan={p} />;
    case "study":
      return <StudyBlock plan={p} />;
    case "meal":
      return <MealBlock plan={p} />;
    case "bjj":
      return <BjjBlock plan={p} />;
    case "recovery":
      return <RecoveryBlock plan={p} />;
    case "social":
      return <SocialBlock plan={p} />;
    case "hobby":
      return <HobbyBlock plan={p} />;
    case "work":
      return <WorkBlock plan={p} />;
    case "sleep":
      return <SleepBlock plan={p} />;
  }
}
