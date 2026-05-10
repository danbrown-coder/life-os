import "@/lib/reanimated-shim";
import "@/global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import { useSession } from "@/lib/state/session";
import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/lib/state/demoMode";
import { ensureWebFonts } from "@/lib/web-fonts";

ensureWebFonts();

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function RootGate() {
  const { session, loading } = useSession();
  const demo = useDemoMode((s) => s.enabled);
  const router = useRouter();
  const segments = useSegments();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  // fetch onboarded flag whenever session changes
  useEffect(() => {
    let cancelled = false;
    if (!session) {
      setOnboarded(null);
      return;
    }
    supabase
      .from("profiles")
      .select("onboarded")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setOnboarded(Boolean(data?.onboarded));
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";
    const inApp = segments[0] === "(app)";

    if (demo) {
      if (!inApp) router.replace("/(app)");
      return;
    }

    if (!session && !inAuth) {
      router.replace("/(auth)/sign-in");
      return;
    }
    if (session && onboarded === false && !inOnboarding) {
      router.replace("/(onboarding)");
      return;
    }
    if (session && onboarded === true && (inAuth || inOnboarding)) {
      router.replace("/(app)");
    }
  }, [session, loading, onboarded, segments, demo]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color="#C01F26" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0E0D0B" },
        animation: "fade",
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={qc}>
          <StatusBar style="light" />
          <RootGate />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
