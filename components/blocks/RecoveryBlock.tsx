import { Text, View } from "react-native";
import { z } from "zod";
import type { RecoveryPlanZ } from "@/lib/ai/schemas";
import { Section, Bullet } from "./Section";

type Plan = z.infer<typeof RecoveryPlanZ>;

export function RecoveryBlock({ plan }: { plan: Plan }) {
  return (
    <View className="gap-8">
      <Section title={plan.type} roman="I">
        {plan.notes && (
          <Text
            className="font-serif text-bone-300"
            style={{ fontSize: 16, lineHeight: 24 }}
          >
            {plan.notes}
          </Text>
        )}
      </Section>
      <Section title="Steps" roman="II">
        {plan.steps.map((s, i) => (
          <Bullet key={i}>{s}</Bullet>
        ))}
      </Section>
    </View>
  );
}
