import { useMemo } from "react";
import { View, Text } from "react-native";
import dayjs from "dayjs";
import { cn } from "./cn";
import { HairlineRule } from "./HairlineRule";

// A running serial number that nudges every screen mount. It's not real
// data — it's a chronicle conceit that makes every screen feel like an
// issue of a journal.
let __issueCounter = 419;
function nextIssueNumber() {
  __issueCounter = __issueCounter + 1;
  if (__issueCounter > 9999) __issueCounter = 100;
  return __issueCounter;
}

type MastheadProps = {
  // Section name shown beside the logotype, e.g. "WEEK", "MEMORY".
  section?: string;
  // Custom serial number, e.g. "WEEK 19" — defaults to a running counter.
  serial?: string;
  // Custom date string, defaults to today.
  date?: string;
  // Centered, oversized variant for cover pages (sign-in, sign-up).
  variant?: "default" | "cover";
  className?: string;
};

export function Masthead({
  section,
  serial,
  date,
  variant = "default",
  className,
}: MastheadProps) {
  const issue = useMemo(
    () => serial ?? `No. ${String(nextIssueNumber()).padStart(4, "0")}`,
    [serial]
  );
  const today = useMemo(
    () => date ?? dayjs().format("ddd DD MMM").toUpperCase(),
    [date]
  );

  if (variant === "cover") {
    return (
      <View className={cn("items-center", className)}>
        <Text
          className="font-mono uppercase text-bone-700"
          style={{
            fontSize: 11,
            letterSpacing: 4,
          }}
        >
          AN ADAPTIVE LIFE OPERATING SYSTEM
        </Text>
        <Text
          className="font-serif text-bone mt-3"
          style={{
            fontSize: 64,
            lineHeight: 64,
            letterSpacing: -2.5,
            // @ts-expect-error web style
            fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
          }}
        >
          LifeOS
        </Text>
        <View className="mt-3 flex-row items-center">
          <View className="h-px w-8 bg-rule-loud" />
          <Text
            className="font-mono uppercase text-bone-500 mx-3"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            {issue}
          </Text>
          <View className="h-px w-8 bg-rule-loud" />
        </View>
      </View>
    );
  }

  return (
    <View className={cn("w-full", className)}>
      <View className="flex-row items-baseline justify-between">
        <View className="flex-row items-baseline">
          <Text
            className="font-serif text-bone"
            style={{
              fontSize: 22,
              letterSpacing: -0.5,
              // @ts-expect-error web style
              fontVariationSettings: '"opsz" 36, "wght" 600',
            }}
          >
            Life
          </Text>
          <Text
            className="font-mono text-lacquer"
            style={{ fontSize: 18, letterSpacing: 0 }}
          >
            /
          </Text>
          <Text
            className="font-serif text-bone"
            style={{
              fontSize: 22,
              letterSpacing: -0.5,
              // @ts-expect-error web style
              fontVariationSettings: '"opsz" 36, "wght" 600',
            }}
          >
            OS
          </Text>
          {section ? (
            <>
              <Text
                className="font-mono text-bone-500 ml-3"
                style={{ fontSize: 10, letterSpacing: 3 }}
              >
                ·
              </Text>
              <Text
                className="font-mono uppercase text-bone-300 ml-3"
                style={{ fontSize: 10, letterSpacing: 3 }}
              >
                {section}
              </Text>
            </>
          ) : null}
        </View>
        <View className="flex-row items-baseline">
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            {issue}
          </Text>
          <Text
            className="font-mono text-bone-700 mx-2"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            ·
          </Text>
          <Text
            className="font-mono uppercase text-bone-500"
            style={{ fontSize: 10, letterSpacing: 3 }}
          >
            {today}
          </Text>
        </View>
      </View>
      <HairlineRule className="mt-4" tone="loud" thickness={2} />
      <HairlineRule className="mt-1" tone="default" />
    </View>
  );
}

// A compact section kicker — used inside the body, not at the top.
// Renders a mono micro-cap label preceded by an em-rule.
export function Kicker({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "lacquer" | "sage" | "bone";
  className?: string;
}) {
  const toneClass =
    tone === "lacquer"
      ? "text-lacquer"
      : tone === "sage"
        ? "text-sage"
        : tone === "bone"
          ? "text-bone"
          : "text-bone-300";
  return (
    <View className={cn("flex-row items-center", className)}>
      <View
        className={
          tone === "lacquer"
            ? "h-px w-6 bg-lacquer"
            : "h-px w-6 bg-rule-loud"
        }
      />
      <Text
        className={cn("font-mono uppercase ml-2", toneClass)}
        style={{ fontSize: 10, letterSpacing: 3 }}
      >
        {children}
      </Text>
    </View>
  );
}

// A "dateline" label (small mono caps with optional rule on the right).
// Used inside content rows.
export function Dateline({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text
      className={cn("font-mono uppercase text-bone-500", className)}
      style={{ fontSize: 10, letterSpacing: 3 }}
    >
      {children}
    </Text>
  );
}
