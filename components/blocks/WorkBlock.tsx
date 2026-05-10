import { Text, View } from "react-native";
import { z } from "zod";
import type { WorkPlanZ } from "@/lib/ai/schemas";
import { Section, Bullet } from "./Section";

type Plan = z.infer<typeof WorkPlanZ>;
const ROMAN = ["I", "II", "III", "IV"];

export function WorkBlock({ plan }: { plan: Plan }) {
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
      <Section title="Block type" roman={ROMAN[r++]}>
        <View className="border border-rule px-2.5 py-1 self-start">
          <Text
            className="font-mono uppercase text-bone-300"
            style={{ fontSize: 11, letterSpacing: 2.5 }}
          >
            {plan.focus_block}
          </Text>
        </View>
      </Section>
      {plan.tasks.length > 0 && (
        <Section title="Tasks" roman={ROMAN[r++]}>
          {plan.tasks.map((t, i) => (
            <Bullet key={i}>{t}</Bullet>
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
    </View>
  );
}
