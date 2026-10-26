import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { apiRequest } from "../../services/api";
import { EmptyState } from "../../components/EmptyState";
import type { Assignment, Course } from "../../types/api";

function startOfWeek(date: Date) { const result = new Date(date); const day = result.getDay(); result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day)); result.setHours(0, 0, 0, 0); return result; }
function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

export default function CalendarScreen() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(new Date());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [error, setError] = useState("");
  const load = useCallback(async () => { setError(""); try { const [a, c] = await Promise.all([apiRequest<{ items: Assignment[] }>("/assignments?limit=100&page=1"), apiRequest<Course[]>("/courses")]); setAssignments(a.items); setCourses(c); } catch (err) { setError(err instanceof Error ? err.message : "Không thể tải lịch."); throw err; } }, []);
  useEffect(() => { void load().finally(() => setLoading(false)); }, [load]);
  const week = useMemo(() => { const monday = startOfWeek(selected); return Array.from({ length: 7 }, (_, index) => { const date = new Date(monday); date.setDate(monday.getDate() + index); return date; }); }, [selected]);
  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const dayItems = useMemo(() => assignments.filter((item) => sameDay(new Date(item.dueAt), selected)).sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt)), [assignments, selected]);
  if (loading) return <View style={[styles.center, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color={colors.primary} /><Text style={[styles.muted, { color: colors.muted }]}>Đang tải lịch...</Text></View>;
  return <ScrollView style={[styles.screen, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load().finally(() => setRefreshing(false)); }} tintColor={colors.primary} />}>
    <View style={styles.head}><View><Text style={[styles.title, { color: colors.text }]}>Lịch tuần</Text><Text style={[styles.muted, { color: colors.muted }]}>Xem deadline theo tuần.</Text></View><Pressable onPress={() => router.push("/tabs/assignments")}><Ionicons name="add-circle" size={34} color={colors.primary} /></Pressable></View>
    {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    <Text style={[styles.weekTitle, { color: colors.muted }]}>Tuần này</Text><Text style={[styles.range, { color: colors.text }]}>{week[0].getDate()} – {week[6].getDate()} {week[6].toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}</Text>
    <View style={[styles.week, { backgroundColor: colors.surface, borderColor: colors.line }]}>{week.map((date) => { const active = sameDay(date, selected); const has = assignments.some((item) => sameDay(new Date(item.dueAt), date)); return <Pressable key={date.toISOString()} onPress={() => setSelected(date)} style={styles.day}><Text style={[styles.dayLabel, { color: colors.muted }]}>{date.toLocaleDateString("vi-VN", { weekday: "short" }).replace("Th ", "T")}</Text><View style={[styles.date, active && { backgroundColor: colors.primary }]}><Text style={[styles.dateText, { color: active ? "#FFF" : colors.text }]}>{date.getDate()}</Text></View><View style={[styles.indicator, { backgroundColor: has ? colors.primary : "transparent" }]} /></Pressable>; })}</View>
    <Text style={[styles.section, { color: colors.text }]}>{selected.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })}</Text>
    {dayItems.length ? dayItems.map((item) => { const course = courseMap.get(item.courseId); const color = colors.primary; return <Pressable key={item.id} onPress={() => router.push(`/assignments/${item.id}`)} style={[styles.event, { backgroundColor: colors.surface, borderColor: colors.line }]}><Text style={[styles.time, { color: colors.muted }]}>{new Date(item.dueAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</Text><View style={[styles.eventBody, { borderLeftColor: color }]}><Text style={[styles.eventTitle, { color: colors.text }]}>{item.title}</Text><Text style={[styles.eventMeta, { color: colors.muted }]}>{course?.name ?? ""}</Text><Text style={[styles.eventStatus, { color: item.status === "completed" ? colors.success : color }]}>{item.status === "completed" ? "Đã hoàn thành" : "Hạn nộp"}</Text></View></Pressable>; }) : <EmptyState title="Không có deadline" message="Ngày được chọn chưa có bài tập." icon="calendar-clear-outline" />}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, content: { padding: 20, paddingBottom: 30 }, center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 }, muted: { fontSize: 11, marginTop: 4 }, head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, title: { fontSize: 25, fontWeight: "800" }, error: { fontSize: 10, marginTop: 12 }, weekTitle: { fontSize: 11, fontWeight: "700", marginTop: 22 }, range: { fontSize: 14, fontWeight: "800", marginTop: 5 }, week: { flexDirection: "row", justifyContent: "space-between", borderWidth: 1, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 7, marginTop: 14 }, day: { alignItems: "center", gap: 7 }, dayLabel: { fontSize: 9 }, date: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" }, dateText: { fontSize: 12, fontWeight: "700" }, indicator: { width: 5, height: 5, borderRadius: 3 }, section: { fontSize: 15, fontWeight: "800", marginTop: 24, marginBottom: 11 }, event: { borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: "row", gap: 12, marginBottom: 9 }, time: { width: 42, fontSize: 10, paddingTop: 10 }, eventBody: { flex: 1, borderLeftWidth: 4, paddingLeft: 11, paddingVertical: 3 }, eventTitle: { fontSize: 12, fontWeight: "700" }, eventMeta: { fontSize: 10, marginTop: 4 }, eventStatus: { fontSize: 9, fontWeight: "800", marginTop: 5 },
});
