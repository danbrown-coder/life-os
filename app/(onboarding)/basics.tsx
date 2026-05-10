import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { useOnboarding } from "@/lib/state/onboardingStore";
import { StepFooter, StepHeader } from "@/components/onboarding/StepFooter";

export default function Basics() {
  const router = useRouter();
  const ob = useOnboarding();

  return (
    <Screen>
      <StepHeader
        step={1}
        total={6}
        title="The basics."
        subtitle="Wake and sleep are the spine of your day."
      />
      <View className="gap-6 mt-2">
        <Input
          label="WHAT SHOULD WE CALL YOU?"
          value={ob.display_name}
          onChangeText={(v) => ob.set("display_name", v)}
          placeholder="First name"
        />
        <View className="flex-row gap-6">
          <View className="flex-1">
            <Input
              label="WAKE"
              value={ob.wake_time}
              onChangeText={(v) => ob.set("wake_time", v)}
              placeholder="06:30"
            />
          </View>
          <View className="flex-1">
            <Input
              label="SLEEP"
              value={ob.sleep_time}
              onChangeText={(v) => ob.set("sleep_time", v)}
              placeholder="22:30"
            />
          </View>
        </View>
        <Text
          className="font-serif italic text-bone-500"
          style={{ fontSize: 14, lineHeight: 20 }}
        >
          Don't overthink — these are defaults the system can move around when reality hits.
        </Text>
      </View>
      <StepFooter
        onBack={() => router.back()}
        onNext={() => router.push("/(onboarding)/goals")}
        nextDisabled={!ob.display_name.trim()}
      />
    </Screen>
  );
}
