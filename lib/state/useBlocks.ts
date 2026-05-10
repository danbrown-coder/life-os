import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { getBlocksForDate, getBlocksForWeek, getBlock } from "@/lib/db/queries";
import { mockWeek } from "@/lib/mock/data";
import type { TimeBlock } from "@/lib/db/types";
import { DEMO_USER_ID, useDemoMode } from "@/lib/state/demoMode";

function useUserId() {
  const demo = useDemoMode((s) => s.enabled);
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    if (demo) {
      setId(DEMO_USER_ID);
      return;
    }
    supabase.auth.getUser().then(({ data }) => setId(data.user?.id ?? null));
  }, [demo]);
  return id;
}

// Falls back to mock data when no blocks exist yet (pre-AI). This keeps the
// app feeling alive while the user gets the edge functions deployed.
function withFallback(blocks: TimeBlock[], userId: string | null, filter: (b: TimeBlock) => boolean) {
  if (blocks.length > 0 || !userId) return blocks;
  return mockWeek(userId).filter(filter);
}

export function useTodayBlocks(date: string) {
  const userId = useUserId();
  const demo = useDemoMode((s) => s.enabled);
  return useQuery({
    queryKey: ["blocks", "day", userId, date, demo],
    queryFn: async () => {
      if (!userId) return [];
      if (demo) return mockWeek(userId).filter((b) => b.date === date);
      const real = await getBlocksForDate(userId, date);
      return withFallback(real, userId, (b) => b.date === date);
    },
    enabled: !!userId,
  });
}

export function useWeekBlocks(start: string, end: string) {
  const userId = useUserId();
  const demo = useDemoMode((s) => s.enabled);
  return useQuery({
    queryKey: ["blocks", "week", userId, start, end, demo],
    queryFn: async () => {
      if (!userId) return [];
      if (demo) return mockWeek(userId).filter((b) => b.date >= start && b.date <= end);
      const real = await getBlocksForWeek(userId, start, end);
      return withFallback(real, userId, (b) => b.date >= start && b.date <= end);
    },
    enabled: !!userId,
  });
}

export function useBlock(id: string | undefined) {
  const userId = useUserId();
  const demo = useDemoMode((s) => s.enabled);
  return useQuery({
    queryKey: ["block", id, demo],
    queryFn: async () => {
      if (!id) return null;
      if (demo || id.startsWith("mock-")) {
        const all = userId ? mockWeek(userId) : [];
        return all.find((b) => b.id === id) ?? null;
      }
      return getBlock(id);
    },
    enabled: !!id,
  });
}

export { useUserId };
