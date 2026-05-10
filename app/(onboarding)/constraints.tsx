import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { useOnboarding } from "@/lib/state/onboardingStore";
import { StepFooter, StepHeader } from "@/components/onboarding/StepFooter";

const TYPES = ["injury", "equipment", "schedule", "allergy", "budget", "other"];

const SUGGESTIONS = [
  { type: "injury", description: "Lower back — careful with heavy deadlifts" },
  { type: "equipment", description: "No squat rack at home" },
  { type: "schedule", description: "Class M/W/F 9–11am" },
  { type: "allergy", description: "Lactose intolerant" },
  { type: "budget", description: "Tight food budget" },
];

export default function Constraints() {
  const router = useRouter();
  const ob = useOnboarding();
  const [type, setType] = useState("injury");
  const [desc, setDesc] = useState("");

  function add(t: string, d: string) {
    if (!d.trim()) return;
    ob.addConstraint({
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: t,
      description: d.trim(),
    });
    setDesc("");
  }

  return (
    <Screen>
      <StepHeader
        step={4}
        total={6}
        title="What's the reality of your week?"
        subtitle="Injuries, fixed classes, no equipment, allergies — anything that narrows the field."
      />

      <View className="gap-5 mt-2">
        <View className="gap-3">
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            TYPE
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {TYPES.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={type === t}
                onPress={() => setType(t)}
              />
            ))}
          </View>
        </View>

        <Input
          label="DESCRIBE"
          value={desc}
          onChangeText={setDesc}
          placeholder="e.g. nagging right shoulder"
          onSubmitEditing={() => add(type, desc)}
        />
        <Button
          title="Add"
          variant="secondary"
          onPress={() => add(type, desc)}
          disabled={!desc.trim()}
        />
      </View>

      {ob.constraints.length === 0 && (
        <View className="gap-3 mt-2">
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            COMMON ONES
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <Chip
                key={i}
                label={s.description}
                onPress={() => add(s.type, s.description)}
              />
            ))}
          </View>
        </View>
      )}

      {ob.constraints.length > 0 && (
        <View className="mt-2">
          <Text
            className="font-mono uppercase text-bone-500 mb-3"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            YOUR CONSTRAINTS · {String(ob.constraints.length).padStart(2, "0")}
          </Text>
          <HairlineRule tone="loud" />
          {ob.constraints.map((c, i) => (
            <View key={c.id}>
              <View className="flex-row items-baseline gap-4 py-4">
                <Text
                  className="font-mono text-bone-700"
                  style={{ fontSize: 11, letterSpacing: 1.5 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <View className="flex-1 gap-1">
                  <Text
                    className="font-mono uppercase text-bone-500"
                    style={{ fontSize: 10, letterSpacing: 2.5 }}
                  >
                    {c.type}
                  </Text>
                  <Text
                    className="font-serif text-bone"
                    style={{ fontSize: 16, lineHeight: 22 }}
                  >
                    {c.description}
                  </Text>
                </View>
                <Pressable onPress={() => ob.removeConstraint(c.id)}>
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
        onNext={() => router.push("/(onboarding)/food")}
      />
    </Screen>
  );
}
