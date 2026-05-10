import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { Masthead } from "@/components/ui/Masthead";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Button } from "@/components/ui/Button";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import {
  listMemory,
  setMemoryConfirmed,
  deactivateMemory,
} from "@/lib/db/queries";
import { useUserId } from "@/lib/state/useBlocks";
import type { MemoryFact } from "@/lib/db/types";
import { aiClient } from "@/lib/ai/client";
import { todayISO } from "@/lib/utils/time";
import { useDemoMode } from "@/lib/state/demoMode";
import { demoMemoryFacts } from "@/lib/mock/demoData";

export default function Memory() {
  const userId = useUserId();
  const demo = useDemoMode((s) => s.enabled);
  const [facts, setFacts] = useState<MemoryFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (demo) {
      setFacts(demoMemoryFacts);
      setLoading(false);
      return;
    }
    if (!userId) return;
    setLoading(true);
    const data = await listMemory(userId);
    setFacts(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [userId, demo]);

  async function refresh() {
    if (demo) return;
    setRefreshing(true);
    try {
      await aiClient.extractMemory(todayISO());
      await load();
    } catch (e) {
      // silent
    } finally {
      setRefreshing(false);
    }
  }

  const sorted = [...facts].sort((a, b) => {
    if (a.user_confirmed !== b.user_confirmed) return a.user_confirmed ? -1 : 1;
    return (b.confidence ?? 0) - (a.confidence ?? 0);
  });

  return (
    <Screen>
      <Masthead
        section="MEMORY"
        serial={`THE LIFE GRAPH · ${facts.length} ENTRIES`}
      />

      <View className="gap-3">
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          THE LIFE GRAPH
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
          What we've learned about you.
        </Text>
        <Text
          className="font-serif text-bone-300"
          style={{ fontSize: 16, lineHeight: 22 }}
        >
          Every entry is a durable behavioral fact — confirmed or estimated — that shapes the next plan. Confirm what's true; deactivate what isn't.
        </Text>
      </View>

      <View className="self-start">
        <Button
          title={refreshing ? "Reflecting…" : "Re-learn from today"}
          variant="secondary"
          onPress={refresh}
          loading={refreshing}
        />
      </View>

      {!loading && facts.length === 0 && (
        <View className="border-y border-rule py-8">
          <Text
            className="font-serif italic text-bone-500 text-center"
            style={{ fontSize: 15, lineHeight: 22 }}
          >
            Nothing learned yet. Use the app for a few days —{"\n"}
            record check-ins, mark blocks complete, override what doesn't fit —{"\n"}
            and patterns will appear here.
          </Text>
        </View>
      )}

      <View>
        <HairlineRule tone="loud" thickness={2} />
        {sorted.map((f, i) => (
          <FactRow
            key={f.id}
            index={i + 1}
            fact={f}
            onConfirm={async () => {
              if (demo) {
                setFacts((prev) =>
                  prev.map((x) =>
                    x.id === f.id
                      ? {
                          ...x,
                          user_confirmed: !x.user_confirmed,
                          confidence: !x.user_confirmed ? 100 : 50,
                        }
                      : x
                  )
                );
                return;
              }
              await setMemoryConfirmed(f.id, !f.user_confirmed);
              load();
            }}
            onRemove={async () => {
              if (demo) {
                setFacts((prev) => prev.filter((x) => x.id !== f.id));
                return;
              }
              await deactivateMemory(f.id);
              load();
            }}
          />
        ))}
      </View>
    </Screen>
  );
}

function FactRow({
  index,
  fact,
  onConfirm,
  onRemove,
}: {
  index: number;
  fact: MemoryFact;
  onConfirm: () => void;
  onRemove: () => void;
}) {
  const conf = fact.confidence ?? 0;
  return (
    <View>
      <View className="py-5 gap-3">
        <View className="flex-row items-baseline justify-between">
          <Text
            className="font-mono text-bone-500"
            style={{ fontSize: 11, letterSpacing: 1.5 }}
          >
            M-{String(index).padStart(3, "0")}
          </Text>
          {fact.domain && (
            <CategoryBadge
              category={fact.domain as NonNullable<MemoryFact["domain"]>}
            />
          )}
        </View>

        <Text
          className="font-serif text-bone"
          style={{ fontSize: 17, lineHeight: 24 }}
        >
          {fact.fact}
        </Text>

        <View className="flex-row items-center gap-3">
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 10, letterSpacing: 2.5 }}
          >
            CONFIDENCE
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className="font-serif text-bone"
              style={{
                fontSize: 18,
                // @ts-expect-error web style
                fontVariationSettings: '"opsz" 36, "wght" 500',
              }}
            >
              {conf}
            </Text>
            <Text
              className="font-mono text-bone-700"
              style={{ fontSize: 11 }}
            >
              /100
            </Text>
          </View>
          <View className="flex-1 h-px bg-rule">
            <View
              style={{
                height: 1,
                width: `${Math.max(2, Math.min(100, conf))}%`,
                backgroundColor: fact.user_confirmed
                  ? "#7DA67A"
                  : conf > 70
                    ? "#F1ECE2"
                    : "#E2A53C",
              }}
            />
          </View>
        </View>

        {fact.source && (
          <Text
            className="font-mono uppercase text-bone-700"
            style={{ fontSize: 9, letterSpacing: 2 }}
          >
            SOURCE · {fact.source}
          </Text>
        )}

        <View className="flex-row gap-5 mt-1">
          <Pressable onPress={onConfirm}>
            <Text
              className={
                fact.user_confirmed
                  ? "font-mono uppercase text-sage"
                  : "font-mono uppercase text-bone"
              }
              style={{ fontSize: 11, letterSpacing: 2.5 }}
            >
              {fact.user_confirmed ? "✓ CONFIRMED" : "CONFIRM"}
            </Text>
          </Pressable>
          <Pressable onPress={onRemove}>
            <Text
              className="font-mono uppercase text-lacquer"
              style={{ fontSize: 11, letterSpacing: 2.5 }}
            >
              NOT TRUE
            </Text>
          </Pressable>
        </View>
      </View>
      <HairlineRule tone="default" />
    </View>
  );
}
