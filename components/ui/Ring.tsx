import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { cn } from "./cn";

// Editorial ring. Track is bone-quiet, value-arc is lacquer by default.
// The center value is rendered as a Fraunces serif numeral with optical
// sizing. Public API unchanged.
export function Ring({
  value,
  size = 88,
  stroke = 4,
  label,
  sublabel,
  color = "#C01F26",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = Math.PI * 2 * r;
  const v = Math.max(0, Math.min(100, value));
  const dash = c * (v / 100);
  const numeralSize = Math.round(size * 0.36);
  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#2A2722"
          strokeWidth={stroke}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="butt"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text
          className="font-serif text-bone"
          style={{
            fontSize: numeralSize,
            lineHeight: numeralSize + 2,
            letterSpacing: -1,
            // @ts-expect-error web style
            fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
          }}
        >
          {Math.round(v)}
        </Text>
        {label && (
          <Text
            className={cn("font-mono uppercase text-bone-500 mt-1")}
            style={{ fontSize: 9, letterSpacing: 2.5 }}
          >
            {label}
          </Text>
        )}
      </View>
      {sublabel && (
        <Text
          className="font-mono uppercase text-bone-700 mt-2"
          style={{ fontSize: 10, letterSpacing: 2.5 }}
        >
          {sublabel}
        </Text>
      )}
    </View>
  );
}
