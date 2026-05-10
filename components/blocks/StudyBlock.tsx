import { Text, View } from "react-native";
import { z } from "zod";
import type { StudyPlanZ } from "@/lib/ai/schemas";
import { Section, Bullet } from "./Section";

type Plan = z.infer<typeof StudyPlanZ>;
const ROMAN = ["I", "II", "III", "IV", "V"];

export function StudyBlock({ plan }: { plan: Plan }) {
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

      <Section title="Task" roman={ROMAN[r++]}>
        <Text
          className="font-serif text-bone-300"
          style={{ fontSize: 15, lineHeight: 22 }}
        >
          {plan.task}
        </Text>
      </Section>

      {plan.method.length > 0 && (
        <Section title="Method" roman={ROMAN[r++]}>
          <View className="flex-row flex-wrap gap-2">
            {plan.method.map((m, i) => (
              <View key={i} className="border border-rule px-2.5 py-1">
                <Text
                  className="font-mono uppercase text-bone-300"
                  style={{ fontSize: 10, letterSpacing: 2.5 }}
                >
                  {m}
                </Text>
              </View>
            ))}
          </View>
        </Section>
      )}

      <Section title="Steps" roman={ROMAN[r++]}>
        <View>
          {plan.steps.map((s, i) => (
            <View key={i}>
              <View className="flex-row items-baseline gap-4 py-3">
                <Text
                  className="font-mono text-bone-700 w-6"
                  style={{ fontSize: 11, letterSpacing: 1.5 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <Text
                  className="font-serif text-bone flex-1"
                  style={{ fontSize: 15, lineHeight: 22 }}
                >
                  {s.description}
                </Text>
                <View className="flex-row items-baseline">
                  <Text
                    className="font-serif text-bone"
                    style={{
                      fontSize: 18,
                      // @ts-expect-error web style
                      fontVariationSettings: '"opsz" 36, "wght" 500',
                    }}
                  >
                    {s.duration_min}
                  </Text>
                  <Text
                    className="font-mono text-bone-500"
                    style={{ fontSize: 11 }}
                  >
                    M
                  </Text>
                </View>
              </View>
              <View className="h-px bg-rule-soft" />
            </View>
          ))}
        </View>
      </Section>

      {plan.rules.length > 0 && (
        <Section title="Rules" roman={ROMAN[r++]}>
          {plan.rules.map((rule, i) => (
            <Bullet key={i}>{rule}</Bullet>
          ))}
        </Section>
      )}
    </View>
  );
}
