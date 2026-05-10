import { Text, View } from "react-native";
import { z } from "zod";
import type { SocialPlanZ } from "@/lib/ai/schemas";
import { Section } from "./Section";

type Plan = z.infer<typeof SocialPlanZ>;
const ROMAN = ["I", "II", "III", "IV"];

const energyLabel: Record<Plan["energy_required"], string> = {
  low: "Low energy — easy hangout",
  med: "Medium — engaged but not draining",
  high: "High — bring your A game",
};

export function SocialBlock({ plan }: { plan: Plan }) {
  let r = 0;
  return (
    <View className="gap-8">
      <Section title="Intention" roman={ROMAN[r++]}>
        <Text
          className="font-serif text-bone"
          style={{ fontSize: 17, lineHeight: 26 }}
        >
          {plan.intention}
        </Text>
      </Section>
      {plan.with_whom && (
        <Section title="With" roman={ROMAN[r++]}>
          <Text
            className="font-serif text-bone-300"
            style={{ fontSize: 15, lineHeight: 22 }}
          >
            {plan.with_whom}
          </Text>
        </Section>
      )}
      <Section title="Energy" roman={ROMAN[r++]}>
        <Text
          className="font-serif text-bone"
          style={{ fontSize: 16, lineHeight: 24 }}
        >
          {energyLabel[plan.energy_required]}
        </Text>
      </Section>
      {plan.notes && (
        <Section title="Notes" roman={ROMAN[r++]}>
          <Text
            className="font-serif text-bone-300"
            style={{ fontSize: 15, lineHeight: 22 }}
          >
            {plan.notes}
          </Text>
        </Section>
      )}
    </View>
  );
}
