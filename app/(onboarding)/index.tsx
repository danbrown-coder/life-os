import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Masthead } from "@/components/ui/Masthead";
import { HairlineRule } from "@/components/ui/HairlineRule";

export default function OnboardingWelcome() {
  const router = useRouter();
  return (
    <Screen contentClassName="px-6 pb-16 gap-0">
      <View className="pt-16 pb-12 items-center">
        <Masthead variant="cover" />
      </View>

      <HairlineRule tone="loud" />

      <View className="pt-12 pb-8 gap-6 max-w-md w-full self-center">
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          INTAKE · OPENING NOTES
        </Text>
        <Text
          className="font-serif text-bone"
          style={{
            fontSize: 44,
            lineHeight: 48,
            letterSpacing: -1.5,
            // @ts-expect-error web style
            fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
          }}
        >
          Build a life that fits you.
        </Text>
        <Text
          className="font-serif text-bone-300"
          style={{ fontSize: 17, lineHeight: 26 }}
        >
          Not a tracker. Not a calendar. An adaptive coach that drafts your week — work, training, study, meals, recovery — and rewrites it as real life intervenes.
        </Text>

        <View className="gap-4 mt-4">
          <Note roman="I">
            The system gets smarter the more you use it.
          </Note>
          <Note roman="II">
            Override anything, any day. No guilt accounting.
          </Note>
          <Note roman="III">
            Every block tells you what, how, and why — never just a time and a title.
          </Note>
        </View>
      </View>

      <HairlineRule tone="default" />

      <View className="pt-10 max-w-md w-full self-center">
        <Button
          title="Begin setup — about 4 minutes"
          onPress={() => router.push("/(onboarding)/basics")}
        />
      </View>
    </Screen>
  );
}

function Note({
  roman,
  children,
}: {
  roman: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row gap-4">
      <Text
        className="font-serif text-bone-500"
        style={{
          fontSize: 14,
          lineHeight: 22,
          // @ts-expect-error web style
          fontVariationSettings: '"opsz" 36, "wght" 500',
        }}
      >
        {roman}.
      </Text>
      <Text
        className="font-serif text-bone flex-1"
        style={{ fontSize: 16, lineHeight: 22 }}
      >
        {children}
      </Text>
    </View>
  );
}
