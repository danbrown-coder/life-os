import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import dayjs from "dayjs";

import { Screen } from "@/components/ui/Screen";
import { Masthead } from "@/components/ui/Masthead";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Button } from "@/components/ui/Button";
import { latestReflection } from "@/lib/db/queries";
import { useUserId } from "@/lib/state/useBlocks";
import type { Reflection } from "@/lib/db/types";
import { aiClient } from "@/lib/ai/client";
import { startOfWeekISO } from "@/lib/utils/time";
import { useDemoMode } from "@/lib/state/demoMode";
import { demoReflection } from "@/lib/mock/demoData";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export default function Reflect() {
  const userId = useUserId();
  const demo = useDemoMode((s) => s.enabled);
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [running, setRunning] = useState(false);

  async function load() {
    if (demo) {
      setReflection(demoReflection);
      return;
    }
    if (!userId) return;
    setReflection(await latestReflection(userId));
  }

  useEffect(() => {
    load();
  }, [userId, demo]);

  async function generate() {
    if (demo) return;
    setRunning(true);
    try {
      await aiClient.weeklyReflection(startOfWeekISO());
      await load();
    } catch (e) {
      // silent
    } finally {
      setRunning(false);
    }
  }

  // Take the first sentence of the summary as a "lede" headline; if none,
  // synthesize one from the first insight.
  const headline = pickHeadline(reflection);
  const lede = pickLede(reflection);
  const dateline = reflection
    ? `DISPATCH · WEEK OF ${dayjs(reflection.week_of).format("MMMM D").toUpperCase()}`
    : `DISPATCH · WEEK OF ${dayjs(startOfWeekISO()).format("MMMM D").toUpperCase()}`;

  return (
    <Screen>
      <Masthead section="REFLECT" />

      {/* Dispatch dateline + run button */}
      <View className="flex-row items-baseline justify-between flex-wrap gap-3">
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          {dateline}
        </Text>
        <Button
          title={running ? "Reading the week…" : "Generate dispatch"}
          variant="secondary"
          onPress={generate}
          loading={running}
        />
      </View>

      {reflection ? (
        <>
          <Text
            className="font-serif text-bone"
            style={{
              fontSize: 56,
              lineHeight: 60,
              letterSpacing: -2.2,
              // @ts-expect-error web style
              fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
            }}
          >
            {headline}
          </Text>

          {lede && (
            <Text
              className="font-serif italic text-bone-300"
              style={{ fontSize: 19, lineHeight: 28 }}
            >
              {lede}
            </Text>
          )}

          <HairlineRule tone="loud" thickness={2} />

          {reflection.summary && (
            <Text
              className="font-serif text-bone"
              style={{ fontSize: 17, lineHeight: 26 }}
            >
              {reflection.summary}
            </Text>
          )}

          {reflection.insights && reflection.insights.length > 0 && (
            <View className="gap-5 mt-4">
              <Text
                className="font-mono uppercase text-bone-500"
                style={{ fontSize: 10, letterSpacing: 3 }}
              >
                INSIGHTS
              </Text>
              <HairlineRule tone="default" />
              {reflection.insights.map((insight, idx) => (
                <View key={idx}>
                  <View className="flex-row gap-5 py-2">
                    <Text
                      className="font-serif text-bone-500"
                      style={{
                        fontSize: 18,
                        lineHeight: 26,
                        // @ts-expect-error web style
                        fontVariationSettings: '"opsz" 36, "wght" 500',
                      }}
                    >
                      {ROMAN[idx] ?? `${idx + 1}`}.
                    </Text>
                    <Text
                      className="font-serif text-bone flex-1"
                      style={{ fontSize: 17, lineHeight: 26 }}
                    >
                      {insight}
                    </Text>
                  </View>
                  {idx < reflection.insights!.length - 1 && (
                    <HairlineRule tone="soft" />
                  )}
                </View>
              ))}
            </View>
          )}

          {reflection.adjustments_for_next_week &&
            reflection.adjustments_for_next_week.length > 0 && (
              <View className="gap-4 mt-6 border-t border-rule pt-6">
                <Text
                  className="font-mono uppercase text-lacquer"
                  style={{ fontSize: 10, letterSpacing: 3 }}
                >
                  FOR NEXT WEEK
                </Text>
                <View>
                  {reflection.adjustments_for_next_week.map((a, idx) => (
                    <View key={idx}>
                      <View className="flex-row gap-3 py-3">
                        <Text
                          className="font-mono text-lacquer"
                          style={{ fontSize: 14, lineHeight: 20 }}
                        >
                          →
                        </Text>
                        <Text
                          className="font-serif text-bone flex-1"
                          style={{ fontSize: 16, lineHeight: 22 }}
                        >
                          {a}
                        </Text>
                      </View>
                      {idx <
                        reflection.adjustments_for_next_week!.length - 1 && (
                        <HairlineRule tone="soft" />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

          <View className="mt-8 items-center">
            <View className="h-px w-12 bg-rule-loud" />
            <Text
              className="font-mono text-bone-700 mt-3"
              style={{ fontSize: 10, letterSpacing: 3 }}
            >
              ✦ END ✦
            </Text>
          </View>
        </>
      ) : (
        <View className="border-y border-rule py-10">
          <Text
            className="font-serif italic text-bone-500 text-center"
            style={{ fontSize: 16, lineHeight: 22 }}
          >
            No dispatch yet.{"\n"}Log a few days of executions and check-ins, then issue your first one.
          </Text>
        </View>
      )}
    </Screen>
  );
}

function pickHeadline(r: Reflection | null): string {
  if (!r) return "Stand by.";
  // Prefer the first short insight; otherwise use first sentence of summary.
  if (r.insights && r.insights[0]) return endWithPeriod(r.insights[0]);
  if (r.summary) {
    const first = r.summary.split(/\.\s|\.$/)[0]?.trim();
    if (first) return endWithPeriod(first);
  }
  return "A week, in summary.";
}

function pickLede(r: Reflection | null): string | null {
  if (!r) return null;
  if (r.summary) {
    const sentences = r.summary.split(/\.\s/);
    if (sentences.length > 1) return endWithPeriod(sentences.slice(1, 2).join(""));
  }
  return null;
}

function endWithPeriod(s: string) {
  const t = s.trim();
  if (!t) return "";
  return /[.!?]$/.test(t) ? t : `${t}.`;
}
