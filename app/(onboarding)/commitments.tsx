import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { useOnboarding } from "@/lib/state/onboardingStore";
import { StepFooter, StepHeader } from "@/components/onboarding/StepFooter";
import type { DomainCategory } from "@/lib/db/types";

const DAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const CATS: DomainCategory[] = [
  "work",
  "study",
  "bjj",
  "fitness",
  "social",
  "hobby",
  "recovery",
];

export default function Commitments() {
  const router = useRouter();
  const ob = useOnboarding();
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState<DomainCategory>("bjj");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [days, setDays] = useState<string[]>([]);

  function toggleDay(d: string) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function add() {
    if (!title.trim()) return;
    const rrule =
      days.length > 0 ? `FREQ=WEEKLY;BYDAY=${days.join(",")}` : undefined;
    ob.addCommitment({
      id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      category: cat,
      start_time: start || undefined,
      end_time: end || undefined,
      rrule,
    });
    setTitle("");
    setStart("");
    setEnd("");
    setDays([]);
  }

  return (
    <Screen>
      <StepHeader
        step={6}
        total={6}
        title="Fixed commitments."
        subtitle="Class times, BJJ schedule, work — the things the system can't move."
      />

      <View className="gap-5 mt-2">
        <Input
          label="TITLE"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. BJJ class"
        />

        <View className="gap-3">
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            CATEGORY
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {CATS.map((c) => (
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

        <View className="flex-row gap-6">
          <View className="flex-1">
            <Input
              label="START"
              value={start}
              onChangeText={setStart}
              placeholder="17:00"
            />
          </View>
          <View className="flex-1">
            <Input
              label="END"
              value={end}
              onChangeText={setEnd}
              placeholder="18:30"
            />
          </View>
        </View>

        <View className="gap-3">
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            DAYS
          </Text>
          <View className="flex-row gap-2">
            {DAYS.map((d) => (
              <Chip
                key={d}
                label={d}
                selected={days.includes(d)}
                onPress={() => toggleDay(d)}
              />
            ))}
          </View>
        </View>

        <Button
          title="Add commitment"
          variant="secondary"
          onPress={add}
          disabled={!title.trim()}
        />
      </View>

      {ob.commitments.length > 0 && (
        <View className="mt-2">
          <Text
            className="font-mono uppercase text-bone-500 mb-3"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            YOUR COMMITMENTS · {String(ob.commitments.length).padStart(2, "0")}
          </Text>
          <HairlineRule tone="loud" />
          {ob.commitments.map((c, i) => (
            <View key={c.id}>
              <View className="flex-row items-baseline gap-4 py-4">
                <Text
                  className="font-mono text-bone-700"
                  style={{ fontSize: 11, letterSpacing: 1.5 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <View className="flex-1 gap-1">
                  {c.category && <CategoryBadge category={c.category} />}
                  <Text
                    className="font-serif text-bone"
                    style={{ fontSize: 16, lineHeight: 22 }}
                  >
                    {c.title}
                  </Text>
                  <Text
                    className="font-mono text-bone-500"
                    style={{ fontSize: 11, letterSpacing: 1.5 }}
                  >
                    {c.start_time}–{c.end_time}
                    {c.rrule
                      ? ` · ${c.rrule.replace("FREQ=WEEKLY;BYDAY=", "")}`
                      : ""}
                  </Text>
                </View>
                <Pressable onPress={() => ob.removeCommitment(c.id)}>
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
        onNext={() => router.push("/(onboarding)/generate")}
        nextLabel="Generate my first plan"
      />
    </Screen>
  );
}
