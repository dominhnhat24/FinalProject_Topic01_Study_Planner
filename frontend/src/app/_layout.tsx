import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Stack, router } from "expo-router";
import * as Notifications from "expo-notifications";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { NetworkBanner } from "../components/NetworkBanner";

import {
  configureNotifications,
  scheduleAssignmentReminders,
} from "../services/notifications";

import {
  syncOfflineMutations,
} from "../services/sync";

import {
  useNetworkStatus,
} from "../services/network";

import type { Assignment } from "../types/api";
import { apiRequest } from "../services/api";

function Navigation() {
  const {
    loading,
    isAuthenticated,
  } = useAuth();

  const {
    colors,
    ready,
    mode,
  } = useTheme();

  const online = useNetworkStatus();

  const refreshOfflineData = useCallback(async () => {
    if (!isAuthenticated || !online) {
      return;
    }

    await syncOfflineMutations();

    try {
      const { items } =
        await apiRequest<{ items: Assignment[] }>(
          "/assignments?limit=100&page=1",
        );

      await Promise.all(
        items
          .filter((item) => item.status === "pending")
          .map(scheduleAssignmentReminders),
      );
    } catch {
      // Cache / sync layer sẽ tiếp tục xử lý.
    }
  }, [isAuthenticated, online]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void configureNotifications();
  }, [isAuthenticated]);

  // Tự đồng bộ khi:
  // 1. login thành công
  // 2. app khởi động có mạng
  // 3. điện thoại vừa offline -> online
  useEffect(() => {
    if (!isAuthenticated || !online) {
      return;
    }

    void refreshOfflineData();
  }, [
    isAuthenticated,
    online,
    refreshOfflineData,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleNotification = (
      response: Notifications.NotificationResponse,
    ) => {
      const assignmentId =
        response.notification.request.content.data
          ?.assignmentId;

      if (typeof assignmentId === "string") {
        router.push(
          `/assignments/${assignmentId}`,
        );
      }
    };

    const subscription =
      Notifications.addNotificationResponseReceivedListener(
        handleNotification,
      );

    void Notifications.getLastNotificationResponseAsync().then(
      (response) => {
        if (response) {
          handleNotification(response);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  if (loading || !ready) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={[
          styles.loading,
          { backgroundColor: colors.bg },
        ]}
      >
        <StatusBar
          style={
            mode === "dark" ? "light" : "dark"
          }
        />

        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text
          style={[
            styles.loadingText,
            { color: colors.muted },
          ]}
        >
          Đang tải Study Planner...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[
        styles.root,
        { backgroundColor: colors.bg },
      ]}
    >
      <StatusBar
        style={
          mode === "dark" ? "light" : "dark"
        }
      />

      <NetworkBanner />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="assignments/[id]" />

        <Stack.Protected
          guard={isAuthenticated}
          redirectTo="/login"
        >
          <Stack.Screen name="tabs" />
        </Stack.Protected>
      </Stack>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  loadingText: {
    fontSize: 13,
  },
});