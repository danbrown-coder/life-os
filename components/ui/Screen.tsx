import {
  ScrollView,
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "./cn";
import { Grain } from "./Grain";

// Canvas with a paper-grain overlay. Generous mobile-first padding,
// settable per screen. Top-edge inset only (the tab bar handles bottom).
// Screen mount transition is handled by expo-router's Stack
// `animation: "fade"` config — no per-screen Reanimated wrapper needed.
export function Screen({
  children,
  scroll = true,
  className,
  contentClassName,
  padded = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
  padded?: boolean;
}) {
  const pad = padded ? "px-6 pt-4 pb-16 gap-6" : "";

  const inner = scroll ? (
    <ScrollView
      className={cn("flex-1", className)}
      contentContainerClassName={cn(pad, contentClassName)}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={cn("flex-1", pad, className, contentClassName)}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <Grain />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {inner}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Simple typeset title block for screens that don't use a Masthead.
// Keeps the historic API (title + optional subtitle).
export function ScreenTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="gap-2">
      <Text
        className="font-serif text-bone"
        style={{
          fontSize: 36,
          lineHeight: 40,
          letterSpacing: -1,
          // @ts-expect-error web style
          fontVariationSettings: '"opsz" 144, "SOFT" 0, "wght" 500',
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
