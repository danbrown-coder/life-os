import { useState } from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";
import { cn } from "./cn";

// Underline-only text field. Label sits above as a mono micro-cap.
// Focus thickens the rule from 1px to 2px in lacquer. Public API matches
// the previous component (label, multiline, all TextInput props).
export function Input({
  label,
  className,
  multiline,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps & { label?: string; className?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View className="gap-2">
      {label && (
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor="#6E665A"
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          "font-serif text-bone py-3",
          multiline && "min-h-[88px] py-3",
          className
        )}
        style={[
          {
            fontSize: 20,
            // @ts-expect-error web style
            outlineStyle: "none",
            borderBottomWidth: focused ? 2 : 1,
            borderBottomColor: focused ? "#C01F26" : "#2A2722",
          },
          // Pass through font variation to feel right at this size.
          // @ts-expect-error web style
          { fontVariationSettings: '"opsz" 36, "wght" 400' },
        ]}
        multiline={multiline}
        {...rest}
      />
    </View>
  );
}
