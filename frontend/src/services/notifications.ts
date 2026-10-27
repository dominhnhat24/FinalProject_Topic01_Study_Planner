import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { Assignment } from "../types/api";
import { planDeadlineReminders } from "../utils/notificationSchedule";

let handlerConfigured = false;
let channelConfigured = false;

export type NotificationSetupResult = {
  supported: boolean;
  granted: boolean;
  reason?: string;
};

export type ScheduleReminderResult = {
  scheduled: number;
  supported: boolean;
  granted: boolean;
  reason?: string;
};

export async function configureNotifications(
  requestPermission = false,
): Promise<NotificationSetupResult> {
  if (Platform.OS === "web") {
    return {
      supported: false,
      granted: false,
      reason: "Thông báo deadline hiện chỉ hỗ trợ trên iOS/Android.",
    };
  }

  try {
    if (!handlerConfigured) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      handlerConfigured = true;
    }

    if (Platform.OS === "android" && !channelConfigured) {
      await Notifications.setNotificationChannelAsync("deadlines", {
        name: "Nhắc hạn nộp bài tập",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
      });

      channelConfigured = true;
    }

    let permission = await Notifications.getPermissionsAsync();

    if (!permission.granted && requestPermission) {
      permission = await Notifications.requestPermissionsAsync();
    }

    if (!permission.granted) {
      return {
        supported: true,
        granted: false,
        reason: "Thiết bị chưa cấp quyền thông báo cho Study Planner.",
      };
    }

    return { supported: true, granted: true };
  } catch (error) {
    return {
      supported: true,
      granted: false,
      reason:
        error instanceof Error
          ? error.message
          : "Không thể thiết lập quyền thông báo.",
    };
  }
}

export async function getScheduledAssignmentReminderCount(
  userId?: string,
): Promise<number> {
  if (Platform.OS === "web" || !userId) {
    return 0;
  }

  try {
    const scheduled =
      await Notifications.getAllScheduledNotificationsAsync();

    return scheduled.filter(
      (item) =>
        Boolean(item.content.data?.assignmentId) &&
        item.content.data?.userId === userId,
    ).length;
  } catch (error) {
    console.warn("Không thể kiểm tra lịch thông báo:", error);
    return 0;
  }
}

export async function scheduleAssignmentReminders(
  assignment: Assignment,
): Promise<ScheduleReminderResult> {
  if (Platform.OS === "web") {
    return {
      scheduled: 0,
      supported: false,
      granted: false,
      reason: "Thông báo deadline chưa hỗ trợ trên web.",
    };
  }

  if (!assignment.id || !assignment.userId) {
    return {
      scheduled: 0,
      supported: true,
      granted: false,
      reason: "Bài tập thiếu ID hoặc thông tin tài khoản.",
    };
  }

  if (assignment.status !== "pending") {
    await cancelAssignmentReminders(
      assignment.id,
      assignment.userId,
    );

    return {
      scheduled: 0,
      supported: true,
      granted: true,
      reason: "Bài tập đã hoàn thành.",
    };
  }

  const preferenceKey =
    `study_planner.notifications.${assignment.userId}`;

  const enabled = await AsyncStorage.getItem(preferenceKey)
    .catch(() => null);

  if (enabled !== "true") {
    await cancelAssignmentReminders(
      assignment.id,
      assignment.userId,
    );

    return {
      scheduled: 0,
      supported: true,
      granted: false,
      reason: "Bạn chưa bật thông báo deadline.",
    };
  }

  const setup = await configureNotifications(false);

  if (!setup.granted) {
    return {
      scheduled: 0,
      supported: setup.supported,
      granted: false,
      reason: setup.reason,
    };
  }

  const planned = planDeadlineReminders(
    assignment.title,
    assignment.dueAt,
  );

  // Xóa lịch cũ trước khi lập lịch mới để tránh thông báo trùng.
  await cancelAssignmentReminders(
    assignment.id,
    assignment.userId,
  );

  if (planned.length === 0) {
    return {
      scheduled: 0,
      supported: true,
      granted: true,
      reason: "Không còn mốc nhắc nào trong tương lai.",
    };
  }

  try {
    for (const reminder of planned) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          sound: "default",
          data: {
            assignmentId: assignment.id,
            userId: assignment.userId,
            reminderKind: reminder.kind,
            dueAt: assignment.dueAt,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(reminder.timestamp),
          channelId: "deadlines",
        },
      });
    }

    // Xác minh lịch đã được hệ điều hành ghi nhận.
    const scheduled =
      await Notifications.getAllScheduledNotificationsAsync();

    const count = scheduled.filter(
      (item) =>
        item.content.data?.assignmentId === assignment.id &&
        item.content.data?.userId === assignment.userId,
    ).length;

    return {
      scheduled: count,
      supported: true,
      granted: true,
      reason:
        count === 0
          ? "Không tìm thấy thông báo trong danh sách lịch chờ."
          : undefined,
    };
  } catch (error) {
    await cancelAssignmentReminders(
      assignment.id,
      assignment.userId,
    );

    return {
      scheduled: 0,
      supported: true,
      granted: true,
      reason:
        error instanceof Error
          ? error.message
          : "Không thể lên lịch thông báo.",
    };
  }
}

export async function cancelAssignmentReminders(
  assignmentId: string,
  userId?: string,
): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    const scheduled =
      await Notifications.getAllScheduledNotificationsAsync();

    const matched = scheduled.filter((item) => {
      if (item.content.data?.assignmentId !== assignmentId) {
        return false;
      }

      // Không hủy lịch của tài khoản khác.
      return userId
        ? item.content.data?.userId === userId
        : true;
    });

    await Promise.all(
      matched.map((item) =>
        Notifications.cancelScheduledNotificationAsync(
          item.identifier,
        ),
      ),
    );
  } catch (error) {
    console.warn("Không thể hủy lịch thông báo:", error);
  }
}

export async function cancelAssignmentRemindersForUser(
  userId: string,
): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    const scheduled =
      await Notifications.getAllScheduledNotificationsAsync();

    const matched = scheduled.filter(
      (item) =>
        Boolean(item.content.data?.assignmentId) &&
        item.content.data?.userId === userId,
    );

    await Promise.all(
      matched.map((item) =>
        Notifications.cancelScheduledNotificationAsync(
          item.identifier,
        ),
      ),
    );
  } catch (error) {
    console.warn(
      "Không thể hủy thông báo của tài khoản:",
      error,
    );
  }
}