import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { apiRequest } from "../../services/api";
import { EmptyState } from "../../components/EmptyState";

function startOfWeek(date: Date) { 
  const result = new Date(date); 
  const day = result.getDay(); 
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day)); 
  result.setHours(0, 0, 0, 0); 
  return result; 
}

function sameDay(a: Date, b: Date) { 
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); 
}

export default function CalendarScreen() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(new Date());
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); 
  const [refreshing, setRefreshing] = useState(false); 
  const [error, setError] = useState("");
  
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");

  const load = useCallback(async () => { 
    setError(""); 
    try { 
      const [a, c] = await Promise.all([
        apiRequest<{ items: any[] }>("/assignments?limit=100&page=1"), 
        apiRequest<any[]>("/courses")
      ]); 
      setAssignments(a.items); 
      setCourses(c); 
    } catch { 
      const mockCourses = [
        { id: "c1", name: "Lập trình React Native", code: "MOBILE101", description: "" },
        { id: "c2", name: "Phát triển Web với ASP.NET Core", code: "WEB202", description: "" },
      ];

      const todayIso = new Date().toISOString();
      const mockAssignments = [
        { id: "a1", courseId: "c1", title: "Hoàn thành giao diện Login & Register", status: "pending", dueAt: todayIso },
        { id: "a2", courseId: "c2", title: "Cấu hình Entity Framework Core", status: "completed", dueAt: todayIso },
      ];

      setCourses(mockCourses);
      setAssignments(mockAssignments);
    } 
  }, []);

  useEffect(() => { void load().finally(() => setLoading(false)); }, [load]);

  const week = useMemo(() => { 
    const monday = startOfWeek(selected); 
    return Array.from({ length: 7 }, (_, index) => { 
      const date = new Date(monday); 
      date.setDate(monday.getDate() + index); 
      return date; 
    }); 
  }, [selected]);

  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);

  const dayItems = useMemo(() => {
    return assignments
      .filter((item) => sameDay(new Date(item.dueAt), selected))
      .filter((item) => {
        if (filterStatus === "pending") return item.status === "pending";
        if (filterStatus === "completed") return item.status === "completed";
        return true;
      })
      .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt));
  }, [assignments, selected, filterStatus]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.muted, { color: colors.muted }]}>Đang tải lịch...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={[styles.screen, { backgroundColor: colors.bg }]} 
      contentContainerStyle={styles.content} 
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={() => { setRefreshing(true); void load().finally(() => setRefreshing(false)); }} 
          tintColor={colors.primary} 
        />
      }
    >
      <View style={styles.head}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Lịch học tập</Text>
          <Text style={[styles.muted, { color: colors.muted }]}>Quản lý deadline thông minh.</Text>
        </View>
        <Pressable onPress={() => router.push("/tabs/assignments")}>
          <Ionicons name="add-circle" size={34} color={colors.primary} />
        </Pressable>
      </View>

      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
      
      <Text style={[styles.weekTitle, { color: colors.muted }]}>Tuần này</Text>
      <Text style={[styles.range, { color: colors.text }]}>
        {week[0].getDate()} – {week[6].getDate()} {week[6].toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
      </Text>
      
      <View style={[styles.week, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        {week.map((date) => { 
          const active = sameDay(date, selected); 
          const has = assignments.some((item) => sameDay(new Date(item.dueAt), date)); 
          return (
            <Pressable key={date.toISOString()} onPress={() => setSelected(date)} style={styles.day}>
              <Text style={[styles.dayLabel, { color: colors.muted }]}>
                {date.toLocaleDateString("vi-VN", { weekday: "short" }).replace("Th ", "T")}
              </Text>
              <View style={[styles.date, active && { backgroundColor: colors.primary }]}>
                <Text style={[styles.dateText, { color: active ? "#FFF" : colors.text }]}>{date.getDate()}</Text>
              </View>
              <View style={[styles.indicator, { backgroundColor: has ? colors.primary : "transparent" }]} />
            </Pressable>
          ); 
        })}
      </View>

      <View style={styles.filterRow}>
        {(["all", "pending", "completed"] as const).map((statusKey) => {
          const isActive = filterStatus === statusKey;
          const label = statusKey === "all" ? "Tất cả" : statusKey === "pending" ? "Chưa làm" : "Đã xong";
          return (
            <Pressable
              key={statusKey}
              onPress={() => setFilterStatus(statusKey)}
              style={[
                styles.filterChip,
                { 
                  backgroundColor: isActive ? colors.primary : colors.surface, 
                  borderColor: isActive ? colors.primary : colors.line 
                }
              ]}
            >
              <Text style={[styles.filterText, { color: isActive ? "#FFF" : colors.text }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.section, { color: colors.text }]}>
        {selected.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })}
      </Text>
      
      {dayItems.length ? dayItems.map((item) => { 
        const course = courseMap.get(item.courseId); 
        const color = colors.primary; 
        return (
          <Pressable 
            key={item.id} 
            onPress={() => router.push(`/assignments/${item.id}`)} 
            style={[styles.event, { backgroundColor: colors.surface, borderColor: colors.line }]}
          >
            <Text style={[styles.time, { color: colors.muted }]}>
              {new Date(item.dueAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </Text>
            <View style={[styles.eventBody, { borderLeftColor: item.status === "completed" ? colors.success : color }]}>
              <Text style={[styles.eventTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.eventMeta, { color: colors.muted }]}>{course?.name ?? "Học phần chung"}</Text>
              <Text style={[styles.eventStatus, { color: item.status === "completed" ? colors.success : color }]}>
                {item.status === "completed" ? "Đã hoàn thành" : "Hạn nộp"}
              </Text>
            </View>
          </Pressable>
        ); 
      }) : <EmptyState title="Không có deadline" message="Không tìm thấy bài tập phù hợp với bộ lọc trong ngày này." icon="calendar-clear-outline" />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, 
  content: { padding: 20, paddingBottom: 30 }, 
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 }, 
  muted: { fontSize: 11, marginTop: 4 }, 
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, 
  title: { fontSize: 25, fontWeight: "800" }, 
  error: { fontSize: 10, marginTop: 12 }, 
  weekTitle: { fontSize: 11, fontWeight: "700", marginTop: 22 }, 
  range: { fontSize: 14, fontWeight: "800", marginTop: 5 }, 
  week: { flexDirection: "row", justifyContent: "space-between", borderWidth: 1, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 7, marginTop: 14 }, 
  day: { alignItems: "center", gap: 7 }, 
  dayLabel: { fontSize: 9 }, 
  date: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" }, 
  dateText: { fontSize: 12, fontWeight: "700" }, 
  indicator: { width: 5, height: 5, borderRadius: 3 }, 
  filterRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  filterText: { fontSize: 11, fontWeight: "700" },
  section: { fontSize: 15, fontWeight: "800", marginTop: 20, marginBottom: 11 }, 
  event: { borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: "row", gap: 12, marginBottom: 9 }, 
  time: { width: 42, fontSize: 10, paddingTop: 10 }, 
  eventBody: { flex: 1, borderLeftWidth: 4, paddingLeft: 11, paddingVertical: 3 }, 
  eventTitle: { fontSize: 12, fontWeight: "700" }, 
  eventMeta: { fontSize: 10, marginTop: 4 }, 
  eventStatus: { fontSize: 9, fontWeight: "800", marginTop: 5 },
});