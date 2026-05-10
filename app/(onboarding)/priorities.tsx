import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { useOnboarding } from "@/lib/state/onboardingStore";
import { StepFooter, StepHeader } from "@/components/onboarding/StepFooter";

// Tap-to-reorder. Up/down arrows. Skips a drag library.
export default function Priorities() {
  const router = useRouter();
  const ob = useOnboarding();
  const ranked = ob.priorities
    .map((id) => ob.goals.find((g) => g.id === id))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  function move(id: string, dir: -1 | 1) {
    const idx = ob.priorities.indexOf(id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= ob.priorities.length) return;
    const arr = [...ob.priorities];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    ob.reorderPriorities(arr);
  }

  return (
    <Screen>
      <StepHeader
        step={3}
        total={6}
        title="Rank your priorities."
        subtitle="Higher rank means better slots, more energy, more frequency."
      />

      <View className="mt-2">
        <HairlineRule tone="loud" />
        {ranked.map((g, i) => (
          <View key={g.id}>
            <View className="flex-row items-baseline gap-4 py-4">
              <Text
                className="font-serif text-bone"
                style={{
                  fontSize: 28,
                  lineHeight: 28,
                  letterSpacing: -0.5,
                  width: 36,
                  // @ts-expect-error web style
                  fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </Text>
              <View className="flex-1 gap-1">
                <CategoryBadge category={g.category} />
                <Text
                  className="font-serif text-bone"
                  style={{ fontSize: 17, lineHeight: 24 }}
                >
                  {g.title}
                </Text>
              </View>
              <View className="gap-2">
                <Pressable
                  onPress={() => move(g.id, -1)}
                  className="border border-rule px-3 py-1"
                  disabled={i === 0}
                >
                  <Text
                    className={
                      i === 0
                        ? "font-mono text-bone-700"
                        : "font-mono text-bone"
                    }
                    style={{ fontSize: 12 }}
                  >
                    ↑
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => move(g.id, 1)}
                  className="border border-rule px-3 py-1"
                  disabled={i === ranked.length - 1}
                >
                  <Text
                    className={
                      i === ranked.length - 1
                        ? "font-mono text-bone-700"
                        : "font-mono text-bone"
                    }
                    style={{ fontSize: 12 }}
                  >
                    ↓
                  </Text>
                </Pressable>
              </View>
            </View>
            <HairlineRule tone="soft" />
          </View>
        ))}
      </View>

      <StepFooter
        onBack={() => router.back()}
        onNext={() => router.push("/(onboarding)/constraints")}
      />
    </Screen>
  );
}
