import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Link } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Masthead } from "@/components/ui/Masthead";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { supabase } from "@/lib/supabase";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) Alert.alert("Sign up failed", error.message);
  }

  return (
    <Screen contentClassName="px-6 pb-16 gap-0">
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
          Build the day around you, not the other way around.
        </Text>
      </View>

      <HairlineRule tone="loud" />

      <View className="pt-10 gap-6 max-w-md w-full self-center">
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          INTAKE · NEW SUBJECT
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
          Open a file.
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
            placeholder="at least 8 characters"
          />
          <Button title="Create account" onPress={signUp} loading={loading} />
        </View>

        <Link href="/(auth)/sign-in" asChild>
          <Pressable className="self-center mt-1">
            <Text
              className="font-mono uppercase text-bone-500"
              style={{ fontSize: 11, letterSpacing: 2.5 }}
            >
              Already have an account?{" "}
              <Text className="text-bone underline">Sign in</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
