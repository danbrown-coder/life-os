import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Masthead } from "@/components/ui/Masthead";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useUserId } from "@/lib/state/useBlocks";
import { setPhase } from "@/lib/db/queries";
import type { PerformanceMode, Profile } from "@/lib/db/types";
import { aiClient } from "@/lib/ai/client";
import {
  ensureNotificationPermissions,
  scheduleDailyMorningCheckin,
  scheduleDailyEveningReflection,
} from "@/lib/notifications";
import { useDemoMode } from "@/lib/state/demoMode";
import { demoProfile } from "@/lib/mock/demoData";

const PHASES: { id: PerformanceMode; label: string; desc: string }[] = [
  { id: "default", label: "Default", desc: "Balanced — the everyday baseline." },
  { id: "mass", label: "Mass phase", desc: "Surplus, more lifting volume, less conditioning." },
  { id: "fight_camp", label: "Fight camp", desc: "Conditioning + skill priority, weight management." },
  { id: "exam_week", label: "Exam week", desc: "Brain performance first. Train light. Sleep more." },
  { id: "fat_loss", label: "Cut", desc: "Deficit, satiety, protein + steps." },
  { id: "recovery", label: "Recovery", desc: "Deload. Sleep. Mobility. Inflammation down." },
  { id: "travel", label: "Travel", desc: "Bodyweight, hotel-friendly, low cognitive load." },
];

export default function ProfileScreen() {
  const router = useRouter();
  const userId = useUserId();
  const demo = useDemoMode((s) => s.enabled);
  const setDemo = useDemoMode((s) => s.setEnabled);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [phaseLoading, setPhaseLoading] = useState(false);
  const [notifying, setNotifying] = useState(false);

  async function load() {
    if (demo) {
      setProfile(demoProfile);
      return;
    }
    if (!userId) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data as Profile | null);
  }
  useEffect(() => {
    load();
  }, [userId, demo]);

  async function setMode(p: PerformanceMode) {
    if (demo) {
      setProfile((prev) => (prev ? { ...prev, current_phase: p } : prev));
      return;
    }
    if (!userId) return;
    setPhaseLoading(true);
    await setPhase(userId, p);
    await load();
    try {
      const today = new Date().toISOString().slice(0, 10);
      await aiClient.adjustDay({
        date: today,
        override: `Switched performance mode to ${p}.`,
        chips: [],
      });
    } catch {}
    setPhaseLoading(false);
  }

  async function enableNotifs() {
    if (demo) {
      Alert.alert(
        "Demo mode",
        "Notifications are disabled in demo. Sign in to enable them."
      );
      return;
    }
    setNotifying(true);
    const ok = await ensureNotificationPermissions();
    if (ok) {
      await scheduleDailyMorningCheckin();
      await scheduleDailyEveningReflection();
    }
    setNotifying(false);
  }

  async function detectPhase() {
    if (demo) return;
    setPhaseLoading(true);
    try {
      const r = await aiClient.detectPhase();
      if (userId) await setPhase(userId, r.phase);
      await load();
    } catch {}
    setPhaseLoading(false);
  }

  async function signOut() {
    if (demo) {
      setDemo(false);
      return;
    }
    await supabase.auth.signOut();
  }

  const currentMode = profile?.current_phase ?? "default";

  return (
    <Screen>
      <Masthead section="REGISTRY" />

      {/* Name + current mode */}
      <View className="gap-3">
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          SUBJECT FILE
        </Text>
        <Text
          className="font-serif text-bone"
          style={{
            fontSize: 56,
            lineHeight: 60,
            letterSpacing: -2.2,
            // @ts-expect-error web style
            fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 500',
          }}
        >
          {profile?.display_name
            ? `${profile.display_name}.`
            : "Subject."}
        </Text>
        <Text
          className="font-serif italic text-bone-300"
          style={{ fontSize: 17, lineHeight: 24 }}
        >
          Settings, modes, and the things you can tell the system about how this week is going.
        </Text>
      </View>

      <HairlineRule tone="loud" thickness={2} />

      {/* Vitals registry */}
      <View>
        <Text
          className="font-mono uppercase text-bone-500 mb-3"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          VITALS
        </Text>
        <RegistryRow label="WAKE" value={profile?.wake_time ?? "—"} />
        <RegistryRow label="SLEEP" value={profile?.sleep_time ?? "—"} />
        <RegistryRow label="TIMEZONE" value={profile?.timezone ?? "—"} />
        <RegistryRow
          label="CURRENT MODE"
          value={currentMode.replace("_", " ").toUpperCase()}
          isLast
        />
      </View>

      <View className="self-start">
        <Button
          title="Detect mode from my data"
          variant="secondary"
          onPress={detectPhase}
          loading={phaseLoading}
        />
      </View>

      {/* Modes */}
      <View>
        <Text
          className="font-mono uppercase text-bone-500 mb-3"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          PERFORMANCE MODES
        </Text>
        <HairlineRule tone="loud" />
        {PHASES.map((p, i) => {
          const active = currentMode === p.id;
          return (
            <View key={p.id}>
              <Pressable
                onPress={() => setMode(p.id)}
                className="py-4 active:opacity-70"
              >
                <View className="flex-row items-baseline gap-4">
                  <Text
                    className="font-mono text-bone-700 w-6"
                    style={{ fontSize: 11, letterSpacing: 1.5 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                  <View className="flex-1 gap-1">
                    <Text
                      className={
                        active
                          ? "font-serif text-bone"
                          : "font-serif text-bone"
                      }
                      style={{
                        fontSize: 19,
                        lineHeight: 24,
                        // @ts-expect-error web style
                        fontVariationSettings: '"opsz" 36, "wght" 500',
                      }}
                    >
                      {p.label}
                    </Text>
                    <Text
                      className="font-serif text-bone-300"
                      style={{ fontSize: 14, lineHeight: 20 }}
                    >
                      {p.desc}
                    </Text>
                  </View>
                  {active && (
                    <Text
                      className="font-mono uppercase text-lacquer"
                      style={{ fontSize: 10, letterSpacing: 2.5 }}
                    >
                      ACTIVE
                    </Text>
                  )}
                </View>
              </Pressable>
              {active ? (
                <HairlineRule tone="lacquer" thickness={2} />
              ) : (
                <HairlineRule tone="default" />
              )}
            </View>
          );
        })}
      </View>

      {/* Actions */}
      <View className="gap-3">
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          ACTIONS
        </Text>
        <Button
          title="Edit goals"
          variant="secondary"
          onPress={() => router.push("/(app)/goals")}
        />
        <Button
          title="Enable daily notifications"
          variant="secondary"
          onPress={enableNotifs}
          loading={notifying}
        />
        <Button
          title={demo ? "Exit demo" : "Sign out"}
          variant="danger"
          onPress={signOut}
        />
      </View>
    </Screen>
  );
}

function RegistryRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View>
      <View className="flex-row items-baseline justify-between py-3">
        <Text
          className="font-mono uppercase text-bone-500"
          style={{ fontSize: 10, letterSpacing: 3 }}
        >
          {label}
        </Text>
        <Text
          className="font-serif text-bone"
          style={{
            fontSize: 16,
            // @ts-expect-error web style
            fontVariationSettings: '"opsz" 36, "wght" 500',
          }}
        >
          {value}
        </Text>
      </View>
      {!isLast && <HairlineRule tone="soft" />}
    </View>
  );
}
