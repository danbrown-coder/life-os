import { Pressable, Text } from "react-native";
import { cn } from "./cn";

// Squared chip with a hairline border. Selected state keeps the rule but
// switches its color to lacquer (no fill). Mono uppercase label matches
// the rest of the editorial system.
export function Chip({
  label,
  selected,
  onPress,
  className,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "px-3 py-2 border",
        selected ? "border-lacquer" : "border-rule",
        className
      )}
    >
      <Text
        className={cn(
          "font-mono uppercase",
          selected ? "text-lacquer" : "text-bone-300"
        )}
        style={{ fontSize: 11, letterSpacing: 2.5 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
