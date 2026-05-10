import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import dayjs from "dayjs";

import { Screen } from "@/components/ui/Screen";
import { Masthead } from "@/components/ui/Masthead";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Button } from "@/components/ui/Button";
import { DaySection } from "@/components/timetable/DaySection";
import { useWeekBlocks, useUserId } from "@/lib/state/useBlocks";
import { startOfWeekISO } from "@/lib/utils/time";
import { aiClient } from "@/lib/ai/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "@/lib/state/demoMode";

export default function Week() {
  const userId = useUserId();
  const demo = useDemoMode((s) => s.enabled);
  const [weekStart, setWeekStart] = useState(startOfWeekISO());
  const weekEnd = useMemo(
    () => dayjs(weekStart).add(6, "day").format("YYYY-MM-DD"),
    [weekStart]
  );
  const { data: blocks = [], isLoading } = useWeekBlocks(weekStart, weekEnd);
  const [generating, setGenerating] = useState(false);
  const qc = useQueryClient();

  const days = useMemo(() => {
    const map = new Map<string, typeof blocks>();
    for (let i = 0; i < 7; i++) {
      const d = dayjs(weekStart).add(i, "day").format("YYYY-MM-DD");
      map.set(
        d,
        blocks.filter((b) => b.date === d)
      );
    }
    return Array.from(map.entries());
  }, [blocks, weekStart]);

  async function regen() {
    if (demo) {
      Alert.alert(
        "Demo mode",
        "In a real account, this calls Claude to design a fresh personalized week using your goals, constraints, and life graph. Sign in to try it."
      );
      return;
    }
    setGenerating(true);
    try {
      await aiClient.generateWeek(weekStart);
      await qc.invalidateQueries({ queryKey: ["blocks"] });
    } catch (e) {
      console.warn("regen failed", e);
    } finally {
      setGenerating(false);
    }
  }

  const weekNo = dayjs(weekStart).week();

  return (
    <Screen>
      <Masthead
        section="WEEK"
        serial={`WEEK ${String(weekNo).padStart(2, "0")}`}
        date={`${dayjs(weekStart).format("DD MMM").toUpperCase()} – ${dayjs(weekEnd).format("DD MMM").toUpperCase()}`}
      />

      {/* Nav */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-2">
          <NavButton
            label="← PREV"
            onPress={() =>
              setWeekStart(
                dayjs(weekStart).subtract(7, "day").format("YYYY-MM-DD")
              )
            }
          />
          <NavButton label="THIS WEEK" onPress={() => setWeekStart(startOfWeekISO())} />
          <NavButton
            label="NEXT →"
            onPress={() =>
              setWeekStart(dayjs(weekStart).add(7, "day").format("YYYY-MM-DD"))
            }
          />
        </View>
      </View>

      <View>
        <Text
          className="font-mono uppercase text-bone-500 mb-2"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          PROSPECTUS
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
          Week of {dayjs(weekStart).format("MMM D")}.
        </Text>
        <Text
          className="font-serif text-bone-300 mt-2"
          style={{ fontSize: 16, lineHeight: 22 }}
        >
          Seven days, drafted as one piece. Override anything; the system rebalances around you.
        </Text>
      </View>

      <View className="self-start">
        <Button
          title={generating ? "Designing your week…" : "Regenerate week"}
          variant="secondary"
          onPress={regen}
          loading={generating}
        />
      </View>

      <HairlineRule tone="loud" thickness={2} />

      <View className="gap-10 mt-2">
        {days.map(([date, b], i) => (
          <View key={date}>
            <DaySection date={date} blocks={b} />
            {i < days.length - 1 && (
              <View className="mt-10 h-px bg-rule" />
            )}
          </View>
        ))}
      </View>

      {!isLoading && blocks.length === 0 && (
        <Text
          className="font-serif italic text-bone-500 text-center mt-4"
          style={{ fontSize: 15 }}
        >
          No plan yet. Tap "Regenerate week" to build one.
        </Text>
      )}
    </Screen>
  );
}

function NavButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="border border-rule px-3 py-2">
      <Text
        className="font-mono uppercase text-bone-300"
        style={{ fontSize: 10, letterSpacing: 2.5 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
