import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Masthead } from "@/components/ui/Masthead";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { listGoals } from "@/lib/db/queries";
import { supabase } from "@/lib/supabase";
import { useUserId } from "@/lib/state/useBlocks";
import type { Goal } from "@/lib/db/types";
import { useDemoMode } from "@/lib/state/demoMode";
import { demoGoals } from "@/lib/mock/demoData";

export default function Goals() {
  const router = useRouter();
  const userId = useUserId();
  const demo = useDemoMode((s) => s.enabled);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (demo) {
      setGoals(demoGoals);
      return;
    }
    if (!userId) return;
    setGoals(await listGoals(userId));
  }
  useEffect(() => {
    load();
  }, [userId, demo]);

  async function move(g: Goal, dir: -1 | 1) {
    if (demo) {
      setGoals((prev) => {
        const sorted = [...prev].sort((a, b) => a.priority - b.priority);
        const i = sorted.findIndex((x) => x.id === g.id);
        const j = i + dir;
        if (j < 0 || j >= sorted.length) return prev;
        const tmp = sorted[i].priority;
        sorted[i].priority = sorted[j].priority;
        sorted[j].priority = tmp;
        return [...sorted];
      });
      return;
    }
    const sorted = [...goals].sort((a, b) => a.priority - b.priority);
    const i = sorted.findIndex((x) => x.id === g.id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    const a = sorted[i];
    const b = sorted[j];
    setSaving(true);
    await supabase.from("goals").update({ priority: b.priority }).eq("id", a.id);
    await supabase.from("goals").update({ priority: a.priority }).eq("id", b.id);
    await load();
    setSaving(false);
  }

  async function archive(g: Goal) {
    if (demo) {
      setGoals((prev) => prev.filter((x) => x.id !== g.id));
      return;
    }
    await supabase.from("goals").update({ active: false }).eq("id", g.id);
    await load();
  }

  const sorted = [...goals].sort((a, b) => a.priority - b.priority);

  return (
    <Screen>
      <Masthead section="GOALS" />

      <Pressable onPress={() => router.back()} className="self-start">
        <Text
          className="font-mono uppercase text-bone-300"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          ← BACK
        </Text>
      </Pressable>

      <View className="gap-3">
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          THE BODY OF WORK
        </Text>
        <Text
          className="font-serif text-bone"
          style={{
            fontSize: 44,
            lineHeight: 48,
            letterSpacing: -1.6,
            // @ts-expect-error web style
            fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
          }}
        >
          Your goals.
        </Text>
        <Text
          className="font-serif italic text-bone-300"
          style={{ fontSize: 16, lineHeight: 22 }}
        >
          Higher priority means better slots, more frequency, better recovery.
        </Text>
      </View>

      <HairlineRule tone="loud" thickness={2} />

      <View>
        {sorted.map((g, i) => (
          <View key={g.id}>
            <View className="flex-row items-baseline gap-4 py-5">
              <Text
                className="font-serif text-bone"
                style={{
                  fontSize: 36,
                  lineHeight: 36,
                  letterSpacing: -1,
                  width: 56,
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
                  style={{ fontSize: 19, lineHeight: 24 }}
                >
                  {g.title}
                </Text>
                {g.current_level && (
                  <Text
                    className="font-mono uppercase text-bone-500"
                    style={{ fontSize: 10, letterSpacing: 2 }}
                  >
                    NOW · {g.current_level.toUpperCase()}
                  </Text>
                )}
              </View>
              <View className="gap-2">
                <Pressable
                  onPress={() => move(g, -1)}
                  disabled={saving || i === 0}
                  className="border border-rule px-3 py-1"
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
                  onPress={() => move(g, 1)}
                  disabled={saving || i === sorted.length - 1}
                  className="border border-rule px-3 py-1"
                >
                  <Text
                    className={
                      i === sorted.length - 1
                        ? "font-mono text-bone-700"
                        : "font-mono text-bone"
                    }
                    style={{ fontSize: 12 }}
                  >
                    ↓
                  </Text>
                </Pressable>
                <Pressable onPress={() => archive(g)} className="px-3 py-1">
                  <Text
                    className="font-mono uppercase text-lacquer"
                    style={{ fontSize: 9, letterSpacing: 2 }}
                  >
                    × ARCHIVE
                  </Text>
                </Pressable>
              </View>
            </View>
            <HairlineRule tone="default" />
          </View>
        ))}
      </View>
    </Screen>
  );
}
