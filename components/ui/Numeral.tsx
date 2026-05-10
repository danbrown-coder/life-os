import { Text, type TextProps } from "react-native";
import { cn } from "./cn";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero" | "mega";

const sizeClass: Record<Size, string> = {
  xs: "text-xl",
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-5xl",
  xl: "text-6xl",
  hero: "text-7xl",
  mega: "text-8xl",
};

const lineHeightStyle: Record<Size, number> = {
  xs: 22,
  sm: 28,
  md: 40,
  lg: 52,
  xl: 64,
  hero: 76,
  mega: 96,
};

// Fraunces serif numeral. Uses optical-sizing on web (via the
// font-variation-settings injected at the page level) and falls back
// gracefully on native.
export function Numeral({
  children,
  size = "md",
  tone = "bone",
  className,
  style,
  ...rest
}: {
  children: React.ReactNode;
  size?: Size;
  tone?: "bone" | "muted" | "lacquer" | "sage" | "mustard";
  className?: string;
} & TextProps) {
  const toneClass =
    tone === "bone"
      ? "text-bone"
      : tone === "muted"
        ? "text-bone-300"
        : tone === "lacquer"
          ? "text-lacquer"
          : tone === "sage"
            ? "text-sage"
            : "text-mustard";

  return (
    <Text
      className={cn("font-serif", sizeClass[size], toneClass, className)}
      style={[
        {
          lineHeight: lineHeightStyle[size],
          // @ts-expect-error web-only style passed through to RNW
          fontVariationSettings: '"opsz" 144, "SOFT" 0, "wght" 500',
          letterSpacing: -0.5,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// Display numeral with even softer optical settings for the giant heroes.
export function HeroNumeral({
  children,
  className,
  style,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
} & TextProps) {
  return (
    <Text
      className={cn("font-serif text-bone", className)}
      style={[
        {
          fontSize: 88,
          lineHeight: 92,
          letterSpacing: -2,
          // @ts-expect-error web-only
          fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
