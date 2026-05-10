import { View, ViewProps } from "react-native";
import { cn } from "./cn";

// "Sheet" — replaces the rounded-card pattern. By default no border, no
// rounded corners, no fill. Sheets sit directly on the canvas separated
// by hairline rules and negative space. The public API stays the same so
// every existing call site continues to work.
export function Card({
  className,
  variant = "sheet",
  ...rest
}: ViewProps & {
  className?: string;
  variant?: "sheet" | "rule" | "raised" | "ruled";
}) {
  const v =
    variant === "raised"
      ? "bg-raised border-y border-rule"
      : variant === "rule" || variant === "ruled"
        ? "border-y border-rule"
        : "";
  return <View className={cn("py-5", v, className)} {...rest} />;
}
