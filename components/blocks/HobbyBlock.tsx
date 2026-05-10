import { Text, View } from "react-native";
import { z } from "zod";
import type { HobbyPlanZ } from "@/lib/ai/schemas";
import { Section, Bullet } from "./Section";

type Plan = z.infer<typeof HobbyPlanZ>;

export function HobbyBlock({ plan }: { plan: Plan }) {
  return (
    <View className="gap-8">
      <Section title={plan.hobby} roman="I">
        <Text
          className="font-serif text-bone"
          style={{ fontSize: 17, lineHeight: 26 }}
        >
          {plan.goal}
        </Text>
      </Section>
      {plan.steps.length > 0 && (
        <Section title="Steps" roman="II">
          {plan.steps.map((s, i) => (
            <Bullet key={i}>{s}</Bullet>
          ))}
        </Section>
      )}
    </View>
  );
}
