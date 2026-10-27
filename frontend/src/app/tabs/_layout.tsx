import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home"
              color={String(color ?? colors.muted)}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="courses"
        options={{
          title: "Học phần",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="book-outline"
              color={String(color ?? colors.muted)}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="assignments"
        options={{
          title: "Bài tập",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="checkbox-outline"
              color={String(color ?? colors.muted)}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: "Lịch",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="calendar-outline"
              color={String(color ?? colors.muted)}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              color={String(color ?? colors.muted)}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}