import { Pressable, Text, View } from "react-native";
import dayjs from "dayjs";
import { useRouter } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Masthead, Kicker } from "@/components/ui/Masthead";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { BlockCard } from "@/components/timetable/BlockCard";
import { useTodayBlocks } from "@/lib/state/useBlocks";
import { todayISO } from "@/lib/utils/time";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCheckin, currentPhase } from "@/lib/db/queries";
import { useDemoMode } from "@/lib/state/demoMode";
import {
  demoCurrentPhase,
  demoProfile,
  demoTodayCheckin,
} from "@/lib/mock/demoData";

const phaseLabels: Record<string, string> = {
  default: "DEFAULT",
  mass: "MASS PHASE",
  fight_camp: "FIGHT CAMP",
  exam_week: "EXAM WEEK",
  fat_loss: "CUT",
  recovery: "RECOVERY",
  travel: "TRAVEL",
};

export default function Today() {
  const router = useRouter();
  const date = todayISO();
  const { data: blocks = [] } = useTodayBlocks(date);
  const demo = useDemoMode((s) => s.enabled);
  const setDemo = useDemoMode((s) => s.setEnabled);
  const [name, setName] = useState<string>("");
  const [phase, setPhase] = useState<string>("default");
  const [recoveryScore, setRecoveryScore] = useState<number>(0);
  const [energyScore, setEnergyScore] = useState<number>(0);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    (async () => {
      if (demo) {
        setName(demoProfile.display_name ?? "");
        setPhase(demoCurrentPhase.phase);
        const c = demoTodayCheckin;
        setCheckedIn(true);
        const sleep = c.sleep_quality ?? 5;
        const sore = c.soreness ?? 5;
        const stress = c.stress ?? 5;
        const motivation = c.motivation ?? 5;
        setRecoveryScore(
          Math.round(((sleep + (10 - sore) + (10 - stress)) / 30) * 100)
        );
        setEnergyScore(
          Math.round(((motivation + sleep + (10 - stress)) / 30) * 100)
        );
        return;
      }

      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .maybeSingle();
      if (prof?.display_name) setName(prof.display_name);

      const ph = await currentPhase(userId);
      if (ph) setPhase(ph.phase);

      const c = await getCheckin(userId, date);
      if (c) {
        setCheckedIn(true);
        const sleep = c.sleep_quality ?? 5;
        const sore = c.soreness ?? 5;
        const stress = c.stress ?? 5;
        const motivation = c.motivation ?? 5;
        setRecoveryScore(
          Math.round(((sleep + (10 - sore) + (10 - stress)) / 30) * 100)
        );
        setEnergyScore(
          Math.round(((motivation + sleep + (10 - stress)) / 30) * 100)
        );
      }
    })();
  }, [date, demo]);

  const now = dayjs();
  const current = blocks.find((b) => {
    const s = dayjs(`${b.date}T${b.start_time}`);
    const e = dayjs(`${b.date}T${b.end_time}`);
    return now.isAfter(s) && now.isBefore(e);
  });
  const upcoming = blocks
    .filter((b) => dayjs(`${b.date}T${b.start_time}`).isAfter(now))
    .slice(0, 4);
  const earlier = blocks.filter((b) =>
    dayjs(`${b.date}T${b.end_time}`).isBefore(now)
  );

  const today = dayjs();

  return (
    <Screen>
      {demo && (
        <Pressable
          onPress={() => setDemo(false)}
          className="flex-row items-center justify-between py-2 mb-2"
        >
          <Text
            className="font-mono uppercase text-lacquer"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            DEMO ISSUE · SAMPLE DATA · NOTHING PERSISTS
          </Text>
          <Text
            className="font-mono uppercase text-bone-300"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            EXIT ✕
          </Text>
        </Pressable>
      )}

      <Masthead
        section="TODAY"
        date={today.format("ddd DD MMM").toUpperCase()}
      />

      {/* Greeting */}
      <View className="gap-3">
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          {phaseLabels[phase] ?? phase.toUpperCase()} · {blocks.length} BLOCKS · WEEK {today.week()}
        </Text>
        <Text
          className="font-serif text-bone"
          style={{
            fontSize: 48,
            lineHeight: 50,
            letterSpacing: -1.8,
            // @ts-expect-error web style
            fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
          }}
        >
          {greeting()}{name ? `, ${name}` : ""}.
        </Text>
      </View>

      {/* Energy + Recovery as two big serif fractions */}
      <View>
        <View className="flex-row gap-6">
          <View className="flex-1 gap-2">
            <Text
              className="font-mono uppercase text-bone-500"
              style={{ fontSize: 10, letterSpacing: 3 }}
            >
              ENERGY
            </Text>
            <View className="flex-row items-baseline">
              <Text
                className="font-serif text-bone"
                style={{
                  fontSize: 64,
                  lineHeight: 64,
                  letterSpacing: -2,
                  // @ts-expect-error web style
                  fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
                }}
              >
                {energyScore}
              </Text>
              <Text
                className="font-mono text-bone-500 ml-1"
                style={{ fontSize: 14 }}
              >
                /100
              </Text>
            </View>
          </View>
          <View className="w-px bg-rule self-stretch" />
          <View className="flex-1 gap-2">
            <Text
              className="font-mono uppercase text-bone-500"
              style={{ fontSize: 10, letterSpacing: 3 }}
            >
              RECOVERY
            </Text>
            <View className="flex-row items-baseline">
              <Text
                className="font-serif text-bone"
                style={{
                  fontSize: 64,
                  lineHeight: 64,
                  letterSpacing: -2,
                  // @ts-expect-error web style
                  fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
                }}
              >
                {recoveryScore}
              </Text>
              <Text
                className="font-mono text-sage ml-1"
                style={{ fontSize: 14 }}
              >
                /100
              </Text>
            </View>
          </View>
        </View>
        <HairlineRule className="mt-5" tone="loud" />
        <View className="flex-row items-center justify-between pt-3">
          <Text
            className="font-serif italic text-bone-500"
            style={{ fontSize: 13, lineHeight: 18 }}
          >
            {checkedIn
              ? "Checked in for today."
              : "How are you feeling? Use a check-in to recalibrate."}
          </Text>
          <Pressable onPress={() => router.push("/(app)/adjust")}>
            <Text
              className="font-mono uppercase text-lacquer"
              style={{ fontSize: 10, letterSpacing: 2.5 }}
            >
              {checkedIn ? "UPDATE →" : "30S CHECK-IN →"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Right now */}
      {current && (
        <View className="gap-3">
          <Kicker tone="lacquer">NOW</Kicker>
          <View className="border-l-2 border-lacquer pl-5 -ml-5">
            <BlockCard block={current} hideRule />
          </View>
          <HairlineRule tone="loud" />
        </View>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <View className="gap-3">
          <Kicker>NEXT — UPCOMING</Kicker>
          <View>
            {upcoming.map((b, i) => (
              <BlockCard
                key={b.id}
                block={b}
                hideRule={i === upcoming.length - 1}
              />
            ))}
          </View>
        </View>
      )}

      {/* Earlier */}
      {earlier.length > 0 && (
        <View className="gap-3">
          <Kicker>EARLIER TODAY</Kicker>
          <View className="opacity-50">
            {earlier.map((b, i) => (
              <BlockCard
                key={b.id}
                block={b}
                compact
                hideRule={i === earlier.length - 1}
              />
            ))}
          </View>
        </View>
      )}

      {/* Reality override */}
      <Pressable
        onPress={() => router.push("/(app)/adjust")}
        className="border border-rule py-5 px-5 active:opacity-70"
      >
        <Text
          className="font-mono uppercase text-bone-500 mb-1"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          FIELD UPDATE
        </Text>
        <Text
          className="font-serif text-bone"
          style={{
            fontSize: 22,
            lineHeight: 26,
            letterSpacing: -0.5,
            // @ts-expect-error web style
            fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
          }}
        >
          What changed today?
        </Text>
        <Text
          className="font-serif text-bone-300 mt-1"
          style={{ fontSize: 14, lineHeight: 20 }}
        >
          Bad sleep, sore, busy, sick — we'll adapt the rest of the day.
        </Text>
      </Pressable>

      {blocks.length === 0 && (
        <View className="border-y border-rule py-10 items-center">
          <Text
            className="font-serif italic text-bone-500 text-center"
            style={{ fontSize: 16, lineHeight: 22 }}
          >
            No blocks for today yet.{"\n"}Open Reflect to plan the week.
          </Text>
        </View>
      )}
    </Screen>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 21) return "Evening";
  return "Late";
}
