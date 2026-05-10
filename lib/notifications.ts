import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import dayjs from "dayjs";
import type { TimeBlock } from "@/lib/db/types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

const ID_MORNING = "lifeos.morning";
const ID_EVENING = "lifeos.evening";

export async function scheduleDailyMorningCheckin(hour = 7, minute = 0) {
  await Notifications.cancelScheduledNotificationAsync(ID_MORNING).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: ID_MORNING,
    content: {
      title: "Morning check-in",
      body: "30 seconds. We'll shape the day around you.",
    },
    trigger: { hour, minute, repeats: true } as Notifications.DailyTriggerInput,
  });
}

export async function scheduleDailyEveningReflection(hour = 21, minute = 30) {
  await Notifications.cancelScheduledNotificationAsync(ID_EVENING).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: ID_EVENING,
    content: {
      title: "End-of-day pulse",
      body: "What worked? What didn't? Tap to log.",
    },
    trigger: { hour, minute, repeats: true } as Notifications.DailyTriggerInput,
  });
}

// Schedule a one-shot pre-block reminder 15 minutes before start time.
export async function schedulePreBlock(block: TimeBlock) {
  const start = dayjs(`${block.date}T${block.start_time}`);
  const trigger = start.subtract(15, "minute").toDate();
  if (trigger.getTime() < Date.now() + 60_000) return; // skip past/imminent
  await Notifications.scheduleNotificationAsync({
    identifier: `block-${block.id}`,
    content: {
      title: `${block.title} in 15`,
      body: block.why ?? "Tap for the plan.",
    },
    trigger,
  });
}

export async function cancelAllBlockReminders() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.identifier?.startsWith("block-"))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

export async function reschedulePreBlocks(blocks: TimeBlock[]) {
  await cancelAllBlockReminders();
  for (const b of blocks) await schedulePreBlock(b);
}
