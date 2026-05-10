import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

export function todayISO() {
  return dayjs().format("YYYY-MM-DD");
}

export function startOfWeekISO(d: dayjs.Dayjs = dayjs()) {
  // Monday-based week
  const day = d.day(); // 0=sun..6=sat
  const diff = day === 0 ? -6 : 1 - day;
  return d.add(diff, "day").format("YYYY-MM-DD");
}

export function endOfWeekISO(d: dayjs.Dayjs = dayjs()) {
  return dayjs(startOfWeekISO(d)).add(6, "day").format("YYYY-MM-DD");
}

export function formatTime(t: string) {
  // "HH:mm" -> "h:mm AM/PM"
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function durationMin(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}
