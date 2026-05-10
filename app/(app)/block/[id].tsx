import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { useBlock, useUserId } from "@/lib/state/useBlocks";
import { recordExecution, updateBlockStatus } from "@/lib/db/queries";
import { formatTime, durationMin } from "@/lib/utils/time";

export default function BlockDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const userId = useUserId();
  const { data: block } = useBlock(id);
  const [modifying, setModifying] = useState(false);
  const [modText, setModText] = useState("");

  if (!block) {
    return (
      <Screen>
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 11, letterSpacing: 3 }}
        >
          LOADING…
        </Text>
      </Screen>
    );
  }

  const dur = durationMin(block.start_time, block.end_time);

  async function record(
    status: "completed" | "skipped" | "modified",
    modifications?: string
  ) {
    if (
      !userId ||
      !block ||
      block.id.startsWith("mock-") ||
      block.id.startsWith("demo-")
    ) {
      Alert.alert(
        "Demo mode",
        "This is a sample block. In a real account, this would log the execution and feed your life graph."
      );
      router.back();
      return;
    }
    await updateBlockStatus(block.id, status);
    await recordExecution({
      block_id: block.id,
      user_id: userId,
      completed: status === "completed",
      modifications: modifications ?? null,
      reality: {},
      reflection: null,
    });
    await qc.invalidateQueries({ queryKey: ["blocks"] });
    await qc.invalidateQueries({ queryKey: ["block", block.id] });
    router.back();
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="self-start">
        <Text
          className="font-mono uppercase text-bone-300"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          ← BACK TO TODAY
        </Text>
      </Pressable>

      {/* Kicker */}
      <View className="gap-3 mt-2">
        <View className="flex-row items-center gap-3 flex-wrap">
          <CategoryBadge category={block.category} />
          <Text
            className="font-mono text-bone-700"
            style={{ fontSize: 10, letterSpacing: 2.5 }}
          >
            ·
          </Text>
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 10, letterSpacing: 2.5 }}
          >
            {dayjs(block.date).format("ddd DD MMM").toUpperCase()}
          </Text>
          <Text
            className="font-mono text-bone-700"
            style={{ fontSize: 10, letterSpacing: 2.5 }}
          >
            ·
          </Text>
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 10, letterSpacing: 2.5 }}
          >
            {formatTime(block.start_time)} → {formatTime(block.end_time)} ·{" "}
            {dur}M
          </Text>
          {block.intensity != null && (
            <>
              <Text
                className="font-mono text-bone-700"
                style={{ fontSize: 10, letterSpacing: 2.5 }}
              >
                ·
              </Text>
              <View className="flex-row items-baseline">
                <Text
                  className="font-mono uppercase text-bone-500"
                  style={{ fontSize: 10, letterSpacing: 2.5 }}
                >
                  INTENSITY
                </Text>
                <Text
                  className="font-serif text-bone ml-2"
                  style={{ fontSize: 14 }}
                >
                  {block.intensity}
                </Text>
                <Text
                  className="font-mono text-bone-700"
                  style={{ fontSize: 10 }}
                >
                  /10
                </Text>
              </View>
            </>
          )}
        </View>

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
          {block.title}
        </Text>
        {block.why && (
          <Text
            className="font-serif italic text-bone-300 mt-1"
            style={{ fontSize: 18, lineHeight: 26 }}
          >
            {block.why}
          </Text>
        )}
      </View>

      <HairlineRule tone="loud" thickness={2} />

      {/* Body */}
      <BlockRenderer plan={block.detailed_plan} />

      {/* Footer success criteria */}
      {block.success_criteria && block.success_criteria.length > 0 && (
        <View className="gap-3 mt-4">
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            SUCCESS LOOKS LIKE
          </Text>
          <HairlineRule tone="default" />
          {block.success_criteria.map((s, i) => (
            <View key={i} className="flex-row items-baseline gap-3 py-1">
              <Text
                className="font-serif text-bone-500"
                style={{
                  fontSize: 14,
                  // @ts-expect-error web style
                  fontVariationSettings: '"opsz" 36, "wght" 500',
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </Text>
              <Text
                className="font-serif text-bone flex-1"
                style={{ fontSize: 16, lineHeight: 22 }}
              >
                {s}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Action bar */}
      <View className="mt-6">
        <HairlineRule tone="loud" thickness={2} />
        {!modifying ? (
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1">
              <Button title="Done" onPress={() => record("completed")} />
            </View>
            <View className="flex-1">
              <Button
                title="Modify"
                variant="secondary"
                onPress={() => setModifying(true)}
              />
            </View>
            <View className="flex-1">
              <Button
                title="Skip"
                variant="danger"
                onPress={() => record("skipped")}
              />
            </View>
          </View>
        ) : (
          <View className="gap-4 mt-4">
            <Input
              label="WHAT CHANGED?"
              multiline
              value={modText}
              onChangeText={setModText}
              placeholder="e.g. did 3x5 instead of 5x5; ate pizza instead of meal prep"
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button
                  title="Save"
                  onPress={() => record("modified", modText)}
                  disabled={!modText.trim()}
                />
              </View>
              <View className="flex-1">
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => {
                    setModifying(false);
                    setModText("");
                  }}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}
