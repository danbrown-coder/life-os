import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { HairlineRule } from "@/components/ui/HairlineRule";

export function StepFooter({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  loading,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}) {
  return (
    <View className="mt-10 gap-4">
      <HairlineRule tone="default" />
      <View className="flex-row gap-3">
        {onBack && (
          <View className="flex-1">
            <Button title="Back" variant="secondary" onPress={onBack} />
          </View>
        )}
        <View className="flex-[2]">
          <Button
            title={nextLabel}
            onPress={onNext}
            disabled={nextDisabled}
            loading={loading}
          />
        </View>
      </View>
    </View>
  );
}

// Header for an intake step: "INTAKE · STEP III OF VI" mono micro on top,
// optional roman numeral, plus the question rendered as a Fraunces hero.
export function StepHeader({
  step,
  total,
  title,
  subtitle,
}: {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
}) {
  const roman = toRoman(step);
  const totalRoman = toRoman(total);
  return (
    <View className="gap-5 pt-8">
      <View className="flex-row items-baseline justify-between">
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          INTAKE · STEP {roman} OF {totalRoman}
        </Text>
        <View className="flex-row items-center gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={{
                width: i < step ? 16 : 8,
                height: 1,
                backgroundColor: i < step ? "#C01F26" : "#4A463E",
              }}
            />
          ))}
        </View>
      </View>
      <HairlineRule tone="loud" />
      <Text
        className="font-serif text-bone"
        style={{
          fontSize: 36,
          lineHeight: 40,
          letterSpacing: -1,
          // @ts-expect-error web style
          fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className="font-serif text-bone-300"
          style={{ fontSize: 16, lineHeight: 24 }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

// Kept for backwards compatibility with screens that imported StepProgress
// directly (now folded into StepHeader, but the export still works).
export function StepProgress({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  return (
    <View className="flex-row items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i < step ? 16 : 8,
            height: 1,
            backgroundColor: i < step ? "#C01F26" : "#4A463E",
          }}
        />
      ))}
    </View>
  );
}

function toRoman(n: number): string {
  const map: Array<[number, string]> = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let s = "";
  let r = n;
  for (const [val, sym] of map) {
    while (r >= val) {
      s += sym;
      r -= val;
    }
  }
  return s || "0";
}
