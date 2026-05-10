import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { useOnboarding } from "@/lib/state/onboardingStore";
import { StepFooter, StepHeader } from "@/components/onboarding/StepFooter";

export default function Food() {
  const router = useRouter();
  const ob = useOnboarding();

  return (
    <Screen>
      <StepHeader
        step={5}
        total={6}
        title="How do you eat?"
        subtitle="So we can fuel performance, not just count macros."
      />
      <View className="gap-6 mt-2">
        <Input
          label="FOOD PREFERENCES"
          multiline
          value={ob.food_preferences}
          onChangeText={(v) => ob.set("food_preferences", v)}
          placeholder="e.g. high protein, hate seafood, love rice + chicken, prefer simple meals"
        />
        <Input
          label="COOKING ABILITY / ACCESS"
          multiline
          value={ob.cooking_ability}
          onChangeText={(v) => ob.set("cooking_ability", v)}
          placeholder="e.g. dining hall weekdays, can cook on weekends, no kitchen when traveling"
        />
        <Input
          label="BUDGET / CONTEXT"
          value={ob.budget}
          onChangeText={(v) => ob.set("budget", v)}
          placeholder="e.g. tight student budget"
        />
        <Text
          className="font-serif italic text-bone-500"
          style={{ fontSize: 14, lineHeight: 20 }}
        >
          The system fuels you — what to eat, when, and why. Override anything; it will rebalance the rest of the day.
        </Text>
      </View>
      <StepFooter
        onBack={() => router.back()}
        onNext={() => router.push("/(onboarding)/commitments")}
      />
    </Screen>
  );
}
