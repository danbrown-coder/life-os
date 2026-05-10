import { Text, View } from "react-native";
import { z } from "zod";
import type { WorkoutPlanZ } from "@/lib/ai/schemas";
import { Section, Bullet, StatRow } from "./Section";

type Plan = z.infer<typeof WorkoutPlanZ>;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export function WorkoutBlock({ plan }: { plan: Plan }) {
  let r = 0;
  return (
    <View className="gap-8">
      <Section title="Today's intent" roman={ROMAN[r++]}>
        <Text
          className="font-serif text-bone"
          style={{ fontSize: 17, lineHeight: 26 }}
        >
          {plan.goal}
        </Text>
      </Section>

      {plan.warmup.length > 0 && (
        <Section title="Warmup" roman={ROMAN[r++]}>
          {plan.warmup.map((w, i) => (
            <Bullet key={i}>
              {w.name}
              {w.sets ? ` — ${w.sets}` : ""}
            </Bullet>
          ))}
        </Section>
      )}

      <Section title="Work" roman={ROMAN[r++]}>
        <View>
          {plan.exercises.map((ex, i) => (
            <View key={i} className="py-4">
              <View className="flex-row items-baseline justify-between gap-3">
                <View className="flex-row items-baseline gap-3 flex-1">
                  <Text
                    className="font-mono text-bone-700"
                    style={{ fontSize: 11, letterSpacing: 1.5 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                  <Text
                    className="font-serif text-bone flex-1"
                    style={{
                      fontSize: 18,
                      lineHeight: 24,
                      letterSpacing: -0.3,
                      // @ts-expect-error web style
                      fontVariationSettings: '"opsz" 36, "wght" 500',
                    }}
                  >
                    {ex.name}
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-2">
                  <Text
                    className="font-serif text-bone"
                    style={{
                      fontSize: 22,
                      // @ts-expect-error web style
                      fontVariationSettings: '"opsz" 144, "wght" 500',
                    }}
                  >
                    {ex.sets}
                  </Text>
                  <Text
                    className="font-mono text-bone-500"
                    style={{ fontSize: 12 }}
                  >
                    ×
                  </Text>
                  <Text
                    className="font-serif text-bone"
                    style={{
                      fontSize: 22,
                      // @ts-expect-error web style
                      fontVariationSettings: '"opsz" 144, "wght" 500',
                    }}
                  >
                    {ex.reps}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-baseline gap-4 mt-2 ml-9">
                <Text
                  className="font-mono uppercase text-bone-500"
                  style={{ fontSize: 10, letterSpacing: 2 }}
                >
                  REST {ex.rest_sec}S
                </Text>
                {ex.rpe ? (
                  <Text
                    className="font-mono uppercase text-bone-500"
                    style={{ fontSize: 10, letterSpacing: 2 }}
                  >
                    RPE {ex.rpe}/10
                  </Text>
                ) : null}
              </View>
              {ex.notes && (
                <Text
                  className="font-serif text-bone-300 mt-2 ml-9"
                  style={{ fontSize: 13, lineHeight: 18 }}
                >
                  {ex.notes}
                </Text>
              )}
              <View className="h-px bg-rule-soft mt-4" />
            </View>
          ))}
        </View>
      </Section>

      {plan.cooldown && plan.cooldown.length > 0 && (
        <Section title="Cooldown" roman={ROMAN[r++]}>
          {plan.cooldown.map((c, i) => (
            <Bullet key={i}>{c}</Bullet>
          ))}
        </Section>
      )}

      {plan.rules.length > 0 && (
        <Section title="Rules" roman={ROMAN[r++]}>
          {plan.rules.map((rule, i) => (
            <Bullet key={i}>{rule}</Bullet>
          ))}
        </Section>
      )}

      {plan.nutrition_notes && (
        <Section title="Fuel notes" roman={ROMAN[r++]}>
          <Text
            className="font-serif text-bone-300"
            style={{ fontSize: 15, lineHeight: 22 }}
          >
            {plan.nutrition_notes}
          </Text>
        </Section>
      )}
    </View>
  );
}
