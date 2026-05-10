import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { useOnboarding, type DraftGoal } from "@/lib/state/onboardingStore";
import { StepFooter, StepHeader } from "@/components/onboarding/StepFooter";
import type { DomainCategory } from "@/lib/db/types";

const CATEGORIES: DomainCategory[] = [
  "fitness",
  "nutrition",
  "study",
  "bjj",
  "recovery",
  "social",
  "hobby",
  "work",
  "sleep",
];

const SUGGESTIONS: { category: DomainCategory; title: string }[] = [
  { category: "fitness", title: "Get stronger" },
  { category: "fitness", title: "Build muscle" },
  { category: "fitness", title: "Lose fat" },
  { category: "bjj", title: "Improve BJJ" },
  { category: "study", title: "Improve grades" },
  { category: "study", title: "Pass exam" },
  { category: "work", title: "Build a project" },
  { category: "social", title: "More real connection" },
  { category: "sleep", title: "Sleep 8h consistently" },
  { category: "nutrition", title: "Fuel performance" },
  { category: "hobby", title: "Develop a hobby" },
  { category: "recovery", title: "Manage stress" },
];

export default function Goals() {
  const router = useRouter();
  const ob = useOnboarding();
  const [cat, setCat] = useState<DomainCategory>("fitness");
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");

  function add(c: DomainCategory, t: string) {
    if (!t.trim()) return;
    const g: DraftGoal = {
      id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: c,
      title: t.trim(),
      current_level: level.trim() || undefined,
    };
    ob.addGoal(g);
    setTitle("");
    setLevel("");
  }

  return (
    <Screen>
      <StepHeader
        step={2}
        total={6}
        title="What are you working toward?"
        subtitle="Add a few — we'll rank them next."
      />

      <View className="gap-5 mt-2">
        <View className="gap-3">
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            CATEGORY
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCat(c)}
                className={cat === c ? "" : "opacity-40"}
              >
                <CategoryBadge category={c} />
              </Pressable>
            ))}
          </View>
        </View>

        <Input
          label="GOAL"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. squat 405 by May"
          onSubmitEditing={() => add(cat, title)}
        />
        <Input
          label="CURRENT LEVEL (OPTIONAL)"
          value={level}
          onChangeText={setLevel}
          placeholder="e.g. squat 315 × 5"
        />
        <Button
          title="Add goal"
          variant="secondary"
          onPress={() => add(cat, title)}
          disabled={!title.trim()}
        />
      </View>

      {ob.goals.length === 0 && (
        <View className="gap-3 mt-2">
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            QUICK ADDS
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <Chip
                key={i}
                label={s.title}
                onPress={() => add(s.category, s.title)}
              />
            ))}
          </View>
        </View>
      )}

      {ob.goals.length > 0 && (
        <View className="mt-2">
          <Text
            className="font-mono uppercase text-bone-500 mb-3"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            YOUR GOALS · {String(ob.goals.length).padStart(2, "0")}
          </Text>
          <HairlineRule tone="loud" />
          {ob.goals.map((g, i) => (
            <View key={g.id}>
              <View className="flex-row items-baseline gap-4 py-4">
                <Text
                  className="font-mono text-bone-700"
                  style={{ fontSize: 11, letterSpacing: 1.5 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <View className="flex-1 gap-1">
                  <CategoryBadge category={g.category} />
                  <Text
                    className="font-serif text-bone"
                    style={{ fontSize: 16, lineHeight: 22 }}
                  >
                    {g.title}
                  </Text>
                </View>
                <Pressable onPress={() => ob.removeGoal(g.id)}>
                  <Text
                    className="font-mono uppercase text-lacquer"
                    style={{ fontSize: 10, letterSpacing: 2.5 }}
                  >
                    REMOVE
                  </Text>
                </Pressable>
              </View>
              <HairlineRule tone="soft" />
            </View>
          ))}
        </View>
      )}

      <StepFooter
        onBack={() => router.back()}
        onNext={() => router.push("/(onboarding)/priorities")}
        nextDisabled={ob.goals.length === 0}
      />
    </Screen>
  );
}
