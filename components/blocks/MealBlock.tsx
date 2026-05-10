import { Text, View } from "react-native";
import { z } from "zod";
import type { MealPlanZ } from "@/lib/ai/schemas";
import { Section } from "./Section";

type Plan = z.infer<typeof MealPlanZ>;
const ROMAN = ["I", "II", "III", "IV"];

export function MealBlock({ plan }: { plan: Plan }) {
  let r = 0;
  return (
    <View className="gap-8">
      <Section title={plan.meal_type} roman={ROMAN[r++]}>
        <Text
          className="font-serif italic text-bone-300"
          style={{ fontSize: 16, lineHeight: 24 }}
        >
          {plan.why}
        </Text>
      </Section>

      <Section title="Eat" roman={ROMAN[r++]}>
        <View>
          {plan.items.map((it, i) => (
            <View key={i}>
              <View className="flex-row items-baseline justify-between gap-4 py-3">
                <Text
                  className="font-serif text-bone flex-1"
                  style={{ fontSize: 16, lineHeight: 22 }}
                >
                  {it.food}
                </Text>
                <Text
                  className="font-serif text-bone"
                  style={{
                    fontSize: 16,
                    // @ts-expect-error web style
                    fontVariationSettings: '"opsz" 36, "wght" 500',
                  }}
                >
                  {it.qty}
                </Text>
              </View>
              <View className="h-px bg-rule-soft" />
            </View>
          ))}
        </View>
      </Section>

      {plan.hydration && (
        <Section title="Hydrate" roman={ROMAN[r++]}>
          <Text
            className="font-serif text-bone-300"
            style={{ fontSize: 15, lineHeight: 22 }}
          >
            {plan.hydration}
          </Text>
        </Section>
      )}

      {plan.alternatives && plan.alternatives.length > 0 && (
        <Section title="If life happens" roman={ROMAN[r++]}>
          <View className="gap-5">
            {plan.alternatives.map((alt, i) => (
              <View key={i} className="gap-2">
                <Text
                  className="font-mono uppercase text-bone-500"
                  style={{ fontSize: 10, letterSpacing: 3 }}
                >
                  {alt.context}
                </Text>
                {alt.items.map((it, j) => (
                  <View
                    key={j}
                    className="flex-row items-baseline justify-between"
                  >
                    <Text
                      className="font-serif text-bone"
                      style={{ fontSize: 14, lineHeight: 20 }}
                    >
                      — {it.food}
                    </Text>
                    <Text
                      className="font-serif text-bone-300"
                      style={{ fontSize: 14 }}
                    >
                      {it.qty}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </Section>
      )}
    </View>
  );
}
