import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Assignment } from "../types/api";

let configured = false;

export async function configureNotifications() {
  if (Platform.OS === "web" || configured) {
    return;
  }

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(
        "deadlines",
        {
          name: "Deadline reminders",
          importance: Notifications.AndroidImportance.HIGH,
        },
      );
    }

    await Notifications.requestPermissionsAsync();
    configured = true;
  } catch (error) {
    console.warn(
      "Notification không khả dụng trên môi trường hiện tại:",
      error,
    );
  }
}

export async function scheduleAssignmentReminders(
  assignment: Assignment,
) {
  if (Platform.OS === "web") {
    return;
  }

  // Assignment hoàn thành thì không cần reminder nữa.
  if (assignment.status !== "pending") {
    await cancelAssignmentReminders(assignment.id);
    return;
  }

  try {
    await configureNotifications();

    await cancelAssignmentReminders(assignment.id);

    const due = new Date(assignment.dueAt).getTime();
    const now = Date.now();

    const reminderTimes = [
      due - 24 * 60 * 60 * 1000,
      due - 60 * 60 * 1000,
    ]
      .filter(
        (time, index, all) =>
          time > now + 5000 &&
          all.indexOf(time) === index,
      )
      .sort((a, b) => a - b);

    for (const timestamp of reminderTimes) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Study Planner",
          body: `${assignment.title} sắp đến hạn.`,
          data: {
            assignmentId: assignment.id,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(timestamp),
          channelId: "deadlines",
        },
      });
    }
  } catch (error) {
    // Notification không được phép làm fail CRUD.
    console.warn(
      "Không thể lên lịch notification:",
      error,
    );
  }
}

export async function cancelAssignmentReminders(
  assignmentId: string,
) {
  if (Platform.OS === "web") {
    return;
  }

  try {
    const scheduled =
      await Notifications.getAllScheduledNotificationsAsync();

    const matched = scheduled.filter(
      (item) =>
        item.content.data?.assignmentId === assignmentId,
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
      "Không thể hủy notification:",
      error,
    );
  }
}