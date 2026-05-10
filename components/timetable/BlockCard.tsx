import { Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import type { TimeBlock } from "@/lib/db/types";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { formatTime, durationMin } from "@/lib/utils/time";

// Two-column typeset row: left rail = serif start time + mono duration,
// main column = mono kicker (CATEGORY · INTENSITY 8/10), Fraunces title,
// optional one-line "why". Hairline below each item.
export function BlockCard({
  block,
  compact,
  hideRule,
}: {
  block: TimeBlock;
  compact?: boolean;
  hideRule?: boolean;
}) {
  const dur = durationMin(block.start_time, block.end_time);
  const status = block.status;
  const durLabel =
    dur >= 60
      ? `${(dur / 60).toFixed(dur % 60 ? 1 : 0)}H`
      : `${dur}M`;

  return (
    <Link href={`/(app)/block/${block.id}`} asChild>
      <Pressable className="py-5 active:opacity-70">
        <View className="flex-row gap-5">
          {/* Time rail */}
          <View className="w-20">
            <Text
              className="font-serif text-bone"
              style={{
                fontSize: 26,
                lineHeight: 28,
                letterSpacing: -0.5,
                // @ts-expect-error web style
                fontVariationSettings: '"opsz" 144, "wght" 500',
              }}
            >
              {formatTime(block.start_time)}
            </Text>
            <Text
              className="font-mono text-bone-700 mt-1"
              style={{ fontSize: 10, letterSpacing: 2 }}
            >
              {durLabel}
            </Text>
          </View>

          {/* Body */}
          <View className="flex-1 gap-2">
            <View className="flex-row items-center gap-3 flex-wrap">
              <CategoryBadge category={block.category} />
              {block.intensity != null && (
                <View className="flex-row items-baseline">
                  <Text
                    className="font-mono uppercase text-bone-500"
                    style={{ fontSize: 10, letterSpacing: 2.5 }}
                  >
                    INTENSITY
                  </Text>
                  <Text
                    className="font-serif text-bone ml-2"
                    style={{
                      fontSize: 14,
                      // @ts-expect-error web style
                      fontVariationSettings: '"opsz" 36, "wght" 600',
                    }}
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
              )}
              {status !== "planned" && (
                <View className="flex-row items-center gap-1.5">
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      backgroundColor:
                        status === "completed"
                          ? "#7DA67A"
                          : status === "skipped"
                            ? "#C01F26"
                            : "#E2A53C",
                    }}
                  />
                  <Text
                    className="font-mono uppercase text-bone-500"
                    style={{ fontSize: 10, letterSpacing: 2.5 }}
                  >
                    {status}
                  </Text>
                </View>
              )}
            </View>

            <Text
              className="font-serif text-bone"
              style={{
                fontSize: 22,
                lineHeight: 26,
                letterSpacing: -0.5,
                // @ts-expect-error web style
                fontVariationSettings: '"opsz" 144, "wght" 500',
              }}
            >
              {block.title}
            </Text>

            {!compact && block.why && (
              <Text
                className="font-serif text-bone-300"
                style={{ fontSize: 14, lineHeight: 20 }}
                numberOfLines={2}
              >
                {block.why}
              </Text>
            )}
          </View>
        </View>
        {!hideRule && <HairlineRule className="mt-5" tone="default" />}
      </Pressable>
    </Link>
  );
}
