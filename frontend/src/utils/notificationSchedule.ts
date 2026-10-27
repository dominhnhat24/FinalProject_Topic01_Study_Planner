
export const DEADLINE_REMINDER_OFFSET_MS = 5 * 60 * 1000;
export const NOTIFICATION_SCHEDULING_GUARD_MS = 1000;

export type DeadlineReminderKind = "before_due" | "after_due";

export type PlannedDeadlineReminder = {
  kind: DeadlineReminderKind;
  timestamp: number;
  title: string;
  body: string;
};

export function planDeadlineReminders(
  title: string,
  dueAt: string | Date,
  now: number = Date.now(),
): PlannedDeadlineReminder[] {
  const dueTimestamp = dueAt instanceof Date ? dueAt.getTime() : new Date(dueAt).getTime();
  if (!Number.isFinite(dueTimestamp) || !Number.isFinite(now)) return [];

  const candidates: PlannedDeadlineReminder[] = [
    {
      kind: "before_due",
      timestamp: dueTimestamp - DEADLINE_REMINDER_OFFSET_MS,
      title: "Còn 5 phút đến hạn nộp",
      body: `Bài tập “${title}” sẽ đến hạn sau 5 phút. Hãy kiểm tra và nộp bài đúng giờ.`,
    },
    {
      kind: "after_due",
      timestamp: dueTimestamp + DEADLINE_REMINDER_OFFSET_MS,
      title: "Đã tới giờ nộp bài",
      body: `Hạn nộp bài “${title}” đã qua 5 phút. Hãy nộp bài ngay nếu bạn chưa hoàn thành.`,
    },
  ];

  // OS schedulers require a future trigger. Skip reminders whose time has passed,
  // but retain the +5-minute overdue notice when a deadline is already near/past.
  return candidates.filter(
    (reminder) => reminder.timestamp > now + NOTIFICATION_SCHEDULING_GUARD_MS,
  );
}
