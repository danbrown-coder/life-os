import { Text, View } from "react-native";
import dayjs from "dayjs";
import type { TimeBlock } from "@/lib/db/types";
import { BlockCard } from "./BlockCard";
import { HairlineRule } from "@/components/ui/HairlineRule";

// A typeset day spread. Date as a mono dateline, weekday as Fraunces
// headline, "TODAY" indicated by a small ⌗ glyph + lacquer rule.
export function DaySection({
  date,
  blocks,
}: {
  date: string;
  blocks: TimeBlock[];
}) {
  const d = dayjs(date);
  const isToday = d.isSame(dayjs(), "day");

  return (
    <View className="gap-3">
      <View className="flex-row items-baseline gap-4">
        <View className="flex-row items-baseline gap-3">
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            {d.format("DD MMM").toUpperCase()}
          </Text>
          <Text
            className="font-serif text-bone"
            style={{
              fontSize: 28,
              lineHeight: 32,
              letterSpacing: -0.8,
              // @ts-expect-error web style
              fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
            }}
          >
            {d.format("dddd")}
          </Text>
        </View>
        {isToday && (
          <View className="flex-row items-center gap-1.5">
            <Text
              className="font-mono text-lacquer"
              style={{ fontSize: 14 }}
            >
              ⌗
            </Text>
            <Text
              className="font-mono uppercase text-lacquer"
              style={{ fontSize: 10, letterSpacing: 3 }}
            >
              TODAY
            </Text>
          </View>
        )}
      </View>
      <HairlineRule
        tone={isToday ? "lacquer" : "loud"}
        thickness={isToday ? 2 : 1}
      />
      {blocks.length === 0 ? (
        <Text
          className="font-serif italic text-bone-500 py-4"
          style={{ fontSize: 14 }}
        >
          Nothing scheduled — rest day.
        </Text>
      ) : (
        <View>
          {blocks.map((b, i) => (
            <BlockCard
              key={b.id}
              block={b}
              hideRule={i === blocks.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
}
