import { Pressable, Text, ActivityIndicator, View } from "react-native";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

// Editorial squared button. Primary = lacquer fill on bone text.
// Secondary = bone hairline on transparent. Ghost = no rule, mono link.
// Public API kept identical so existing screens don't break.
export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  className,
  icon,
}: {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  className?: string;
  icon?: React.ReactNode;
}) {
  const styles: Record<Variant, string> = {
    primary: "bg-lacquer active:bg-lacquer-dim",
    secondary: "bg-transparent border border-bone",
    ghost: "bg-transparent",
    danger: "bg-transparent border border-lacquer",
  };
  const text: Record<Variant, string> = {
    primary: "text-bone",
    secondary: "text-bone",
    ghost: "text-bone-300",
    danger: "text-lacquer",
  };
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        "px-6 py-4 flex-row items-center justify-center",
        styles[variant],
        isDisabled && "opacity-40",
        className
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#F1ECE2" : "#C01F26"} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text
            className={cn("font-mono uppercase", text[variant])}
            style={{ fontSize: 12, letterSpacing: 3 }}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
