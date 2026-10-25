
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type TabIconProps = {
  color: string;
  size: number;
};

const COLORS = {
  primary: "#4F46E5",
  muted: "#8A8FA3",
  white: "#FFFFFF",
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: COLORS.white,
          borderTopColor: "#ECEEF4",
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tổng quan",
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: "Lịch",
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="assignments"
        options={{
          title: "Bài tập",
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="checkbox-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="courses"
        options={{
          title: "Học phần",
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="book-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}