import { Text, View } from "react-native";
import { HairlineRule } from "@/components/ui/HairlineRule";

// Section labels become mono uppercase ledes (e.g., "I. WARMUP", "II. WORK").
// A hairline sits below the kicker. Pass a roman to enable the numeral.
export function Section({
  title,
  roman,
  children,
}: {
  title: string;
  roman?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-baseline gap-3">
        {roman && (
          <Text
            className="font-serif text-bone-500"
            style={{
              fontSize: 14,
              // @ts-expect-error web style
              fontVariationSettings: '"opsz" 36, "wght" 500',
            }}
          >
            {roman}.
          </Text>
        )}
        <Text
          className="font-mono uppercase text-bone-300"
          style={{ fontSize: 11, letterSpacing: 3 }}
        >
          {title}
        </Text>
      </View>
      <HairlineRule tone="default" />
      <View className="gap-2">{children}</View>
    </View>
  );
}

// Em-rule bullet, reads like a typeset list, never like a chat list.
export function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row gap-3">
      <Text
        className="font-mono text-bone-500"
        style={{ fontSize: 13, lineHeight: 22 }}
      >
        —
      </Text>
      <Text
        className="font-serif text-bone flex-1"
        style={{ fontSize: 15, lineHeight: 22 }}
      >
        {children}
      </Text>
    </View>
  );
}

// A typeset 3-column row: number, label, value. Used for sets/reps,
// macro tables, etc. Pass roman string for numeral on the left rail.
export function StatRow({
  index,
  label,
  value,
  hint,
}: {
  index?: string | number;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View>
      <View className="flex-row items-baseline justify-between gap-4 py-3">
        <View className="flex-row items-baseline gap-3 flex-1">
          {index != null && (
            <Text
              className="font-mono text-bone-700 w-6"
              style={{ fontSize: 11, letterSpacing: 1.5 }}
            >
              {String(index).padStart(2, "0")}
            </Text>
          )}
          <View className="flex-1">
            <Text
              className="font-serif text-bone"
              style={{ fontSize: 15, lineHeight: 20 }}
            >
              {label}
            </Text>
            {hint && (
              <Text
                className="font-mono uppercase text-bone-500 mt-0.5"
                style={{ fontSize: 10, letterSpacing: 2 }}
              >
                {hint}
              </Text>
            )}
          </View>
        </View>
        <Text
          className="font-serif text-bone"
          style={{
            fontSize: 18,
            // @ts-expect-error web style
            fontVariationSettings: '"opsz" 36, "wght" 500',
            letterSpacing: -0.3,
          }}
        >
          {value}
        </Text>
      </View>
      <HairlineRule tone="soft" />
    </View>
  );
}

// Display an inline serif/mono fraction like 8/10.
export function Fraction({
  num,
  den,
  size = 14,
}: {
  num: string | number;
  den: string | number;
  size?: number;
}) {
  return (
    <View className="flex-row items-baseline">
      <Text
        className="font-serif text-bone"
        style={{
          fontSize: size,
          // @ts-expect-error web style
          fontVariationSettings: '"opsz" 36, "wght" 500',
        }}
      >
        {num}
      </Text>
      <Text
        className="font-mono text-bone-500"
        style={{ fontSize: size * 0.75 }}
      >
        /{den}
      </Text>
    </View>
  );
}
