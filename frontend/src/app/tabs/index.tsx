import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { apiRequest } from "../../services/api";
import { CircularProgress } from "../../components/CircularProgress";
import { EmptyState } from "../../components/EmptyState";
import { dueLabel } from "../../utils/date";

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth() as { user: { name?: string; timezone?: string } | null };
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [a, c, p] = await Promise.all([
        apiRequest<{ items: any[] }>("/assignments?limit=10&page=1&status=pending"),
        apiRequest<any[]>("/courses"),
        apiRequest<any[]>("/assignments/progress"),
      ]);
      setAssignments(a.items);
      setCourses(c);
      setProgress(p);
    } catch {
      // Dữ liệu giả lập an toàn khi chưa bật kết nối MongoDB
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
      setProgress([{ total: 2, completed: 1 }]);
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  
  const apiTotal = progress.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  const apiCompleted = progress.reduce((sum: number, item: any) => sum + (item.completed || 0), 0);
  const fallbackTotal = assignments.length;
  const fallbackCompleted = assignments.filter((a) => a.status === "completed").length;

  const total = apiTotal > 0 ? apiTotal : fallbackTotal;
  const completed = apiTotal > 0 ? apiCompleted : fallbackCompleted;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.muted, { color: colors.muted }]}>Đang tải trang chủ...</Text>
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
          onRefresh={() => {
            setRefreshing(true);
            void load().finally(() => setRefreshing(false));
          }}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcome, { color: colors.muted }]}>Xin chào,</Text>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name ?? "Trịnh Quang Duy"}</Text>
        </View>
        <Pressable onPress={() => router.push("/tabs/profile")} style={[styles.avatar, { backgroundColor: `${colors.primary}18` }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{(user?.name ?? "Trịnh Quang Duy").slice(0, 1).toUpperCase()}</Text>
        </Pressable>
      </View>

      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

      {/* Tiến độ học tập dạng vòng tròn bắt mắt */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <View style={styles.progressRow}>
          <View style={styles.flex}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Tiến độ học tập</Text>
            <Text style={[styles.cardSub, { color: colors.muted }]}>{completed} / {total} bài tập đã hoàn thành</Text>
          </View>
          <CircularProgress value={rate} size={54} />
        </View>
      </View>

      <View style={styles.sectionHead}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Deadline sắp tới</Text>
        <Pressable onPress={() => router.push("/tabs/assignments")}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>Xem tất cả</Text>
        </Pressable>
      </View>

      {assignments.length ? (
        assignments.map((item) => {
          const course = courseMap.get(item.courseId);
          return (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/assignments/${item.id}`)}
              style={[styles.assignmentCard, { backgroundColor: colors.surface, borderColor: colors.line }]}
            >
              <View style={styles.flex}>
                <Text style={[styles.assignmentTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.assignmentMeta, { color: colors.muted }]}>{course?.name ?? "Học phần"} • {dueLabel(item.dueAt, user?.timezone ?? "Asia/Ho_Chi_Minh")}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          );
        })
      ) : (
        <EmptyState title="Không có deadline" message="Hiện tại bạn không có bài tập nào sắp đến hạn." icon="checkmark-done-circle-outline" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 30 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  welcome: { fontSize: 11, fontWeight: "600" },
  name: { fontSize: 20, fontWeight: "800", marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "800" },
  error: { fontSize: 11, marginBottom: 12 },
  card: { borderWidth: 1, borderRadius: 18, padding: 18, marginBottom: 24 },
  progressRow: { flexDirection: "row", alignItems: "center" },
  cardTitle: { fontSize: 15, fontWeight: "800" },
  cardSub: { fontSize: 11, marginTop: 4 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  seeAll: { fontSize: 12, fontWeight: "700" },
  assignmentCard: { borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  assignmentTitle: { fontSize: 13, fontWeight: "700" },
  assignmentMeta: { fontSize: 10, marginTop: 4 },
  flex: { flex: 1 },
  muted: { fontSize: 11 }
});