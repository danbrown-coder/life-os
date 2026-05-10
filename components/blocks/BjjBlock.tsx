import { Text, View } from "react-native";
import { z } from "zod";
import type { BjjPlanZ } from "@/lib/ai/schemas";
import { Section, Bullet } from "./Section";

type Plan = z.infer<typeof BjjPlanZ>;
const ROMAN = ["I", "II", "III", "IV", "V"];

export function BjjBlock({ plan }: { plan: Plan }) {
  let r = 0;
  return (
    <View className="gap-8">
      <Section title="Goal" roman={ROMAN[r++]}>
        <Text
          className="font-serif text-bone"
          style={{ fontSize: 17, lineHeight: 26 }}
        >
          {plan.goal}
        </Text>
      </Section>

      <Section title="Focus" roman={ROMAN[r++]}>
        <View className="flex-row flex-wrap gap-2">
          {plan.focus.map((f, i) => (
            <View key={i} className="border border-rule px-2.5 py-1">
              <Text
                className="font-mono uppercase text-bone-300"
                style={{ fontSize: 10, letterSpacing: 2.5 }}
              >
                {f}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Intensity" roman={ROMAN[r++]}>
        <View className="flex-row items-baseline justify-between py-2">
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 11, letterSpacing: 3 }}
          >
            TARGET
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className="font-serif text-bone"
              style={{
                fontSize: 56,
                lineHeight: 56,
                letterSpacing: -2,
                // @ts-expect-error web style
                fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
              }}
            >
              {plan.intensity_pct}
            </Text>
            <Text
              className="font-mono text-lacquer ml-1"
              style={{ fontSize: 18 }}
            >
              %
            </Text>
          </View>
        </View>
      </Section>

      {plan.rules.length > 0 && (
        <Section title="Rules" roman={ROMAN[r++]}>
          {plan.rules.map((rule, i) => (
            <Bullet key={i}>{rule}</Bullet>
          ))}
        </Section>
      )}

      {plan.post_session.length > 0 && (
        <Section title="Post-session" roman={ROMAN[r++]}>
          {plan.post_session.map((p, i) => (
            <Bullet key={i}>{p}</Bullet>
          ))}
        </Section>
      )}
    </View>
  );
}
