import { describe, expect, it } from "vitest";
import {
  DEADLINE_REMINDER_OFFSET_MS,
  NOTIFICATION_SCHEDULING_GUARD_MS,
  planDeadlineReminders,
} from "../frontend/src/utils/notificationSchedule";

describe("planDeadlineReminders", () => {
  const now = new Date("2026-10-27T12:00:00.000Z").getTime();
  const due = now + 60 * 60 * 1000;

  it("plans exactly one alert 5 minutes before and one 5 minutes after the due time", () => {
    const planned = planDeadlineReminders("Bài tập Toán", new Date(due).toISOString(), now);
    expect(planned).toHaveLength(2);
    expect(planned[0].kind).toBe("before_due");
    expect(planned[0].timestamp).toBe(due - DEADLINE_REMINDER_OFFSET_MS);
    expect(planned[0].title).toBe("Còn 5 phút đến hạn nộp");
    expect(planned[1].kind).toBe("after_due");
    expect(planned[1].timestamp).toBe(due + DEADLINE_REMINDER_OFFSET_MS);
    expect(planned[1].title).toBe("Đã tới giờ nộp bài");
  });

  it("does not schedule a pre-deadline alert when that time already passed", () => {
    const dueSoon = now + 2 * 60 * 1000;
    const planned = planDeadlineReminders("Bài tập", new Date(dueSoon), now);
    expect(planned.map((item) => item.kind)).toEqual(["after_due"]);
    expect(planned[0].timestamp).toBe(dueSoon + DEADLINE_REMINDER_OFFSET_MS);
  });

  it("can schedule the overdue alert when the deadline has passed by less than five minutes", () => {
    const overdueByTwoMinutes = now - 2 * 60 * 1000;
    const planned = planDeadlineReminders("Bài tập", new Date(overdueByTwoMinutes), now);
    expect(planned.map((item) => item.kind)).toEqual(["after_due"]);
    expect(planned[0].timestamp).toBe(now + 3 * 60 * 1000);
  });

  it("does not schedule alerts whose times are already in the past", () => {
    const due = now - 10 * 60 * 1000;
    expect(planDeadlineReminders("Bài tập", new Date(due), now)).toEqual([]);
  });

  it("ignores invalid dates", () => {
    expect(planDeadlineReminders("Bài tập", "not-a-date", now)).toEqual([]);
  });

  it("does not pass a trigger inside the OS scheduling guard window", () => {
    const due = now + DEADLINE_REMINDER_OFFSET_MS + NOTIFICATION_SCHEDULING_GUARD_MS + 1;
    const planned = planDeadlineReminders("Bài tập", new Date(due), now);
    expect(planned[0].timestamp).toBeGreaterThan(now + NOTIFICATION_SCHEDULING_GUARD_MS);
  });
});
