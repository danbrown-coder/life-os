import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/Screen";
import { Masthead } from "@/components/ui/Masthead";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StepSlider } from "@/components/ui/Slider";
import { useUserId } from "@/lib/state/useBlocks";
import { upsertCheckin, getCheckin } from "@/lib/db/queries";
import { todayISO } from "@/lib/utils/time";
import { aiClient } from "@/lib/ai/client";
import { useDemoMode } from "@/lib/state/demoMode";
import { demoTodayCheckin } from "@/lib/mock/demoData";

const CHIPS = [
  "slept badly",
  "sore",
  "tired",
  "busy — only 45 min",
  "sick",
  "traveling",
  "low motivation",
  "behind on work",
  "ate poorly",
  "stressed",
  "feeling great",
];

export default function Adjust() {
  const router = useRouter();
  const qc = useQueryClient();
  const userId = useUserId();
  const demo = useDemoMode((s) => s.enabled);
  const date = todayISO();

  const [sleep, setSleep] = useState(7);
  const [soreness, setSoreness] = useState(3);
  const [motivation, setMotivation] = useState(7);
  const [stress, setStress] = useState(4);
  const [chips, setChips] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    if (demo) {
      const c = demoTodayCheckin;
      setSleep(c.sleep_quality ?? 7);
      setSoreness(c.soreness ?? 3);
      setMotivation(c.motivation ?? 7);
      setStress(c.stress ?? 4);
      if (c.notes) setText(c.notes);
      return;
    }
    if (!userId) return;
    getCheckin(userId, date).then((c) => {
      if (!c) return;
      setSleep(c.sleep_quality ?? 7);
      setSoreness(c.soreness ?? 3);
      setMotivation(c.motivation ?? 7);
      setStress(c.stress ?? 4);
      if (c.notes) setText(c.notes);
    });
  }, [userId, date, demo]);

  function toggleChip(c: string) {
    setChips((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  async function saveCheckinOnly() {
    if (demo) {
      Alert.alert(
        "Demo mode",
        "Saved (visually). Sign in to actually persist your check-in."
      );
      router.back();
      return;
    }
    if (!userId) return;
    setSaving(true);
    try {
      await upsertCheckin({
        user_id: userId,
        date,
        sleep_quality: sleep,
        soreness,
        motivation,
        stress,
        time_available_min: null,
        notes: text || null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  async function saveAndAdjust() {
    if (demo) {
      Alert.alert(
        "Demo mode",
        "In a real account, this would call Claude to reshape today's plan around your check-in and override. Sign in to try it for real."
      );
      router.back();
      return;
    }
    if (!userId) return;
    setAdjusting(true);
    try {
      await upsertCheckin({
        user_id: userId,
        date,
        sleep_quality: sleep,
        soreness,
        motivation,
        stress,
        time_available_min: null,
        notes: text || null,
      });
      try {
        await aiClient.adjustDay({ date, override: text, chips });
        await qc.invalidateQueries({ queryKey: ["blocks"] });
      } catch (e: any) {
        Alert.alert(
          "Couldn't adjust today",
          e?.message ?? "Edge function not deployed yet?"
        );
      }
      router.back();
    } finally {
      setAdjusting(false);
    }
  }

  return (
    <Screen>
      <Masthead section="FIELD UPDATE" />

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
          className="font-mono uppercase text-lacquer"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          FIELD UPDATE · {todayISO()}
        </Text>
        <Text
          className="font-serif text-bone"
          style={{
            fontSize: 48,
            lineHeight: 52,
            letterSpacing: -1.8,
            // @ts-expect-error web style
            fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
          }}
        >
          What's going on?
        </Text>
        <Text
          className="font-serif italic text-bone-300"
          style={{ fontSize: 17, lineHeight: 24 }}
        >
          The day reshapes around you — no guilt accounting, no make-up workouts.
        </Text>
      </View>

      <HairlineRule tone="loud" thickness={2} />

      {/* Sliders */}
      <View className="gap-2">
        <Text
          className="font-mono uppercase text-bone-500 mb-1"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          BIOMETRICS
        </Text>
        <StepSlider
          label="SLEEP QUALITY"
          value={sleep}
          onChange={setSleep}
          hint="0 = wrecked, 10 = elite"
        />
        <HairlineRule tone="soft" />
        <StepSlider label="SORENESS" value={soreness} onChange={setSoreness} />
        <HairlineRule tone="soft" />
        <StepSlider
          label="MOTIVATION"
          value={motivation}
          onChange={setMotivation}
        />
        <HairlineRule tone="soft" />
        <StepSlider label="STRESS" value={stress} onChange={setStress} />
      </View>

      {/* Chips */}
      <View className="gap-3">
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          TAP ANY THAT APPLY
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {CHIPS.map((c) => (
            <Chip
              key={c}
              label={c}
              selected={chips.includes(c)}
              onPress={() => toggleChip(c)}
            />
          ))}
        </View>
      </View>

      {/* Free text */}
      <Input
        label="ANYTHING ELSE? (OPTIONAL)"
        multiline
        value={text}
        onChangeText={setText}
        placeholder="e.g. exam tomorrow, only 45 min before BJJ, ate two donuts at the office"
      />

      <HairlineRule tone="loud" thickness={2} />

      {/* Actions */}
      <View className="gap-3">
        <Button
          title={adjusting ? "Reshaping today…" : "Save & adapt today"}
          onPress={saveAndAdjust}
          loading={adjusting}
        />
        <Button
          title="Save check-in only"
          variant="secondary"
          onPress={saveCheckinOnly}
          loading={saving}
        />
      </View>
    </Screen>
  );
}
