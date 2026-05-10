import { View, Pressable, Text } from "react-native";
import { cn } from "./cn";
import { Numeral } from "./Numeral";

// Hash-mark slider. 11 vertical ticks above a centered hairline baseline.
// Filled ticks are bone, the active tick is lacquer (and taller),
// remaining ticks are rule. The current value renders as a big serif
// numeral on the right with mono "/10" suffix. Public API unchanged.
export function StepSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  hint?: string;
}) {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return (
    <View className="gap-3 py-2">
      <View className="flex-row items-end justify-between">
        <Text
          className="font-mono uppercase text-bone-300"
          style={{ fontSize: 11, letterSpacing: 3 }}
        >
          {label}
        </Text>
        <View className="flex-row items-baseline">
          <Numeral size="md">{value}</Numeral>
          <Text
            className="font-mono text-bone-500 ml-1"
            style={{ fontSize: 12 }}
          >
            /{max}
          </Text>
        </View>
      </View>

      {/* Hash marks */}
      <View className="relative h-10 justify-center">
        <View className="absolute left-0 right-0 top-1/2 h-px bg-rule" />
        <View className="flex-row items-center justify-between">
          {steps.map((s) => {
            const isActive = s === value;
            const isFilled = s <= value;
            return (
              <Pressable
                key={s}
                onPress={() => onChange(s)}
                className="flex-1 items-center justify-center h-10"
              >
                <View
                  style={{
                    width: isActive ? 2 : 1,
                    height: isActive ? 28 : isFilled ? 18 : 12,
                    backgroundColor: isActive
                      ? "#C01F26"
                      : isFilled
                        ? "#F1ECE2"
                        : "#4A463E",
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      {hint && (
        <Text
          className="font-serif text-bone-500"
          style={{ fontSize: 13, lineHeight: 18 }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
}
