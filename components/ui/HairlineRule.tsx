import { View } from "react-native";
import { cn } from "./cn";

type Tone = "default" | "loud" | "soft" | "lacquer";

const toneClass: Record<Tone, string> = {
  default: "bg-rule",
  soft: "bg-rule-soft",
  loud: "bg-rule-loud",
  lacquer: "bg-lacquer",
};

// A 1px (or thicker) horizontal rule. Rendered as a plain View — the
// previous Reanimated draw-in was removed because Reanimated 3.16's
// logger module crashes on top-level init in this RN-Web build.
// `animated` and `delay` are accepted for backwards-compat but ignored.
export function HairlineRule({
  tone = "default",
  thickness = 1,
  className,
  animated: _animated,
  delay: _delay,
}: {
  tone?: Tone;
  thickness?: 1 | 2;
  className?: string;
  animated?: boolean;
  delay?: number;
}) {
  return (
    <View
      className={cn("w-full", toneClass[tone], className)}
      style={{ height: thickness }}
    />
  );
}

// A vertical hairline divider used inside rows.
export function VRule({
  tone = "default",
  className,
}: {
  tone?: Tone;
  className?: string;
}) {
  return (
    <View
      className={cn("self-stretch", toneClass[tone], className)}
      style={{ width: 1 }}
    />
  );
}
