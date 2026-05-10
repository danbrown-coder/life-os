import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Link } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Masthead } from "@/components/ui/Masthead";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/lib/state/demoMode";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setDemo = useDemoMode((s) => s.setEnabled);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert("Sign in failed", error.message);
  }

  return (
    <Screen contentClassName="px-6 pb-16 gap-0">
      {/* Cover */}
      <View className="pt-24 pb-16 items-center">
        <Masthead variant="cover" />
        <Text
          className="font-serif text-bone-300 text-center mt-8 px-2"
          style={{
            fontSize: 18,
            lineHeight: 26,
            // @ts-expect-error web style
            fontVariationSettings: '"opsz" 36, "wght" 400',
          }}
        >
          A serious chronicle of your training, study, and rest — adapted to a real life, not an ideal one.
        </Text>
      </View>

      <HairlineRule tone="loud" />

      {/* Form */}
      <View className="pt-10 gap-6 max-w-md w-full self-center">
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          ENTRY · RETURNING
        </Text>
        <Text
          className="font-serif text-bone"
          style={{
            fontSize: 36,
            lineHeight: 40,
            letterSpacing: -1,
            // @ts-expect-error web style
            fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
          }}
        >
          Welcome back.
        </Text>

        <View className="gap-5 mt-2">
          <Input
            label="EMAIL"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@domain.com"
          />
          <Input
            label="PASSWORD"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
          />
          <Button title="Sign in" onPress={signIn} loading={loading} />
        </View>

        <Link href="/(auth)/sign-up" asChild>
          <Pressable className="self-center mt-1">
            <Text
              className="font-mono uppercase text-bone-500"
              style={{ fontSize: 11, letterSpacing: 2.5 }}
            >
              No account?{" "}
              <Text className="text-bone underline">Open an issue</Text>
            </Text>
          </Pressable>
        </Link>
      </View>

      <View className="my-12 max-w-md w-full self-center flex-row items-center gap-4">
        <View className="flex-1 h-px bg-rule" />
        <Text
          className="font-mono uppercase text-bone-700"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          OR
        </Text>
        <View className="flex-1 h-px bg-rule" />
      </View>

      {/* Demo */}
      <View className="max-w-md w-full self-center gap-3">
        <Pressable
          onPress={() => setDemo(true)}
          className="self-start"
          accessibilityRole="link"
        >
          <Text
            className="font-mono uppercase text-lacquer"
            style={{ fontSize: 11, letterSpacing: 3 }}
          >
            → READ THE DEMO ISSUE
          </Text>
        </Pressable>
        <Text
          className="font-serif text-bone-500"
          style={{ fontSize: 13, lineHeight: 19 }}
        >
          Browse every screen on a sample week. No account, no backend; nothing persists.
        </Text>
      </View>
    </Screen>
  );
}
