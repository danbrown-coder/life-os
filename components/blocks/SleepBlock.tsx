import { Text, View } from "react-native";
import { z } from "zod";
import type { SleepPlanZ } from "@/lib/ai/schemas";
import { Section, Bullet } from "./Section";

type Plan = z.infer<typeof SleepPlanZ>;
const ROMAN = ["I", "II", "III"];

export function SleepBlock({ plan }: { plan: Plan }) {
  let r = 0;
  return (
    <View className="gap-8">
      <Section title="Target" roman={ROMAN[r++]}>
        <View className="flex-row items-baseline gap-2">
          <Text
            className="font-serif text-bone"
            style={{
              fontSize: 64,
              lineHeight: 64,
              letterSpacing: -2,
              // @ts-expect-error web style
              fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
            }}
          >
            {plan.target_hours}
          </Text>
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 14, letterSpacing: 2 }}
          >
            HOURS
          </Text>
        </View>
      </Section>
      {plan.pre_sleep_steps.length > 0 && (
        <Section title="Wind-down" roman={ROMAN[r++]}>
          {plan.pre_sleep_steps.map((s, i) => (
            <Bullet key={i}>{s}</Bullet>
          ))}
        </Section>
      )}
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
