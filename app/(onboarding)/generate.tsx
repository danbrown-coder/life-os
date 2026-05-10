import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/state/onboardingStore";
import { supabase } from "@/lib/supabase";
import { aiClient } from "@/lib/ai/client";
import { startOfWeekISO } from "@/lib/utils/time";

const STAGES = [
  "Saving your profile…",
  "Indexing goals and constraints…",
  "Reading your priorities…",
  "Designing your week…",
  "Adding execution detail…",
  "Almost done.",
];

export default function Generate() {
  const router = useRouter();
  const ob = useOnboarding();
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const interval = setInterval(() => {
      if (!cancelled) setStage((s) => Math.min(STAGES.length - 1, s + 1));
    }, 1400);

    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        const userId = u.user?.id;
        if (!userId) throw new Error("Not signed in");

        // 1) profile
        await supabase.from("profiles").update({
          display_name: ob.display_name,
          wake_time: ob.wake_time,
          sleep_time: ob.sleep_time,
          timezone: ob.timezone,
          onboarded: true,
        }).eq("id", userId);

        // 2) goals (with priority from rank)
        const goalRows = ob.priorities.map((id, i) => {
          const g = ob.goals.find((x) => x.id === id)!;
          return {
            user_id: userId,
            category: g.category,
            title: g.title,
            description: g.description ?? null,
            current_level: g.current_level ?? null,
            target_date: g.target_date ?? null,
            priority: i + 1,
          };
        });
        if (goalRows.length) await supabase.from("goals").insert(goalRows);

        // 3) constraints (+ food/cooking/budget folded in as constraints for AI context)
        const constraintRows = [
          ...ob.constraints.map((c) => ({
            user_id: userId,
            type: c.type,
            description: c.description,
          })),
          ob.food_preferences && {
            user_id: userId,
            type: "food",
            description: ob.food_preferences,
          },
          ob.cooking_ability && {
            user_id: userId,
            type: "kitchen",
            description: ob.cooking_ability,
          },
          ob.budget && { user_id: userId, type: "budget", description: ob.budget },
        ].filter(Boolean) as { user_id: string; type: string; description: string }[];
        if (constraintRows.length) await supabase.from("user_constraints").insert(constraintRows);

        // 4) commitments
        const commitmentRows = ob.commitments.map((c) => ({
          user_id: userId,
          title: c.title,
          category: c.category,
          rrule: c.rrule ?? null,
          start_time: c.start_time ?? null,
          end_time: c.end_time ?? null,
          notes: c.notes ?? null,
        }));
        if (commitmentRows.length) await supabase.from("commitments").insert(commitmentRows);

        // 5) life phase: default
        await supabase.from("life_phases").insert({
          user_id: userId,
          phase: "default",
          started_on: new Date().toISOString().slice(0, 10),
          detected_via: "onboarding",
        });

        // 6) generate the week (best-effort — falls through to mock if no API key set)
        try {
          await aiClient.generateWeek(startOfWeekISO());
        } catch (e) {
          console.warn("[lifeos] generate-week failed; user will see empty week.", e);
        }

        if (!cancelled) {
          setDone(true);
          setStage(STAGES.length - 1);
          ob.reset();
          setTimeout(() => router.replace("/(app)"), 600);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? "Something went wrong");
      } finally {
        clearInterval(interval);
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <Screen scroll={false}>
      <View className="flex-1 items-center justify-center gap-8 px-6">
        {error ? (
          <>
            <Text
              className="font-mono uppercase text-lacquer text-center"
              style={{ fontSize: 11, letterSpacing: 3 }}
            >
              ERROR
            </Text>
            <Text
              className="font-serif text-bone text-center"
              style={{ fontSize: 17, lineHeight: 24 }}
            >
              {error}
            </Text>
            <Button
              title="Try again"
              onPress={() => router.replace("/(onboarding)/generate")}
            />
          </>
        ) : (
          <>
            <Text
              className="font-mono uppercase text-bone-500"
              style={{ fontSize: 10, letterSpacing: 4 }}
            >
              IN PRESS
            </Text>
            <Text
              className="font-serif text-bone text-center"
              style={{
                fontSize: 44,
                lineHeight: 48,
                letterSpacing: -1.5,
                // @ts-expect-error web style
                fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
              }}
            >
              Building your LifeOS.
            </Text>
            <View className="h-px w-20 bg-lacquer" />
            <ActivityIndicator color="#C01F26" size="small" />
            <Text
              className="font-serif italic text-bone-300 text-center"
              style={{ fontSize: 16, lineHeight: 22 }}
            >
              {STAGES[stage]}
            </Text>
            {done && (
              <Text
                className="font-mono uppercase text-sage"
                style={{ fontSize: 11, letterSpacing: 3 }}
              >
                READY.
              </Text>
            )}
          </>
        )}
      </View>
    </Screen>
  );
}
