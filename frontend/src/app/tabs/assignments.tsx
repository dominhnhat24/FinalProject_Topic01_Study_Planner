import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { AssignmentFormModal } from "../../components/AssignmentFormModal";
import { EmptyState } from "../../components/EmptyState";
import { useTheme } from "../../context/ThemeContext";
import { apiRequest, NetworkError, queueMutation } from "../../services/api";
import { writeCache } from "../../services/offline";
import { scheduleAssignmentReminders } from "../../services/notifications";
import type { Assignment, Course } from "../../types/api";

type StatusFilter = "all" | "pending" | "completed";

function formatDue(value: string) {
  return new Date(value).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function AssignmentsScreen() {
  const { colors } = useTheme();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [courseId, setCourseId] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const [assignmentData, courseData] = await Promise.all([
        apiRequest<{ items: Assignment[] }>("/assignments?limit=100&page=1"),
        apiRequest<Course[]>("/courses"),
      ]);
      setAssignments(assignmentData.items);
      setCourses(courseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải bài tập.");
      throw err;
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (edit && assignments.length) {
      const target = assignments.find((item) => item.id === edit);
      if (target) { setEditing(target); setModal(true); }
    }
  }, [edit, assignments]);

  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const filtered = useMemo(
    () => assignments.filter((item) => {
      const matchesStatus = status === "all" || item.status === status;
      const matchesCourse = courseId === "all" || item.courseId === courseId;
      const matchesSearch = !search.trim() || item.title.toLowerCase().includes(search.trim().toLowerCase());
      return matchesStatus && matchesCourse && matchesSearch;
    }),
    [assignments, status, courseId, search],
  );

  const saveLocal = (next: Assignment) => {
    setAssignments((current) => {
      const updated = current.some((item) => item.id === next.id)
        ? current.map((item) => (item.id === next.id ? next : item))
        : [...current, next];
      void writeCache("/assignments?limit=100&page=1", {
        items: updated,
        pagination: { page: 1, limit: 100, total: updated.length, totalPages: 1 },
      });
      return updated;
    });
  };

  const toggleStatus = async (item: Assignment) => {
    const previous = item;
    const next: Assignment = { ...item, status: item.status === "completed" ? "pending" : "completed" };
    saveLocal(next);
    try {
      const updated = await apiRequest<Assignment>(`/assignments/${item.id}`, {
        method: "PATCH",
        body: { status: next.status },
      });
      saveLocal(updated);
      await scheduleAssignmentReminders(updated);
    } catch (err) {
      if (err instanceof NetworkError) {
        await queueMutation({
          method: "PATCH",
          path: `/assignments/${item.id}`,
          body: { status: next.status },
          resource: "assignment",
          localId: item.id,
        });
        return;
      }
      saveLocal(previous);
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.muted, { color: colors.muted }]}>Đang tải bài tập...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.bg }]}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load().finally(() => setRefreshing(false)); }} tintColor={colors.primary} />}
      >
        <View style={styles.head}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Bài tập</Text>
            <Text style={[styles.muted, { color: colors.muted }]}>Danh sách dữ liệu thật từ remote API.</Text>
          </View>
          <Pressable
            onPress={() => {
              setEditing(null);
              setModal(true);
            }}
            hitSlop={8}
          >
            <Ionicons name="add-circle" size={34} color={colors.primary} />
          </Pressable>
        </View>

        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.line }]}> 
          <Ionicons name="search-outline" size={17} color={colors.muted} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Tìm bài tập..." placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text }]} />
        </View>

        <View style={styles.segment}>
          {([["all", "Tất cả"], ["pending", "Chưa hoàn thành"], ["completed", "Đã hoàn thành"]] as const).map(([value, label]) => (
            <Pressable key={value} onPress={() => setStatus(value)} style={[styles.segmentItem, { borderColor: colors.line, backgroundColor: colors.surface }, status === value && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
              <Text style={[styles.segmentText, { color: status === value ? "#FFF" : colors.muted }]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {[{ id: "all", label: "Tất cả môn học" }, ...courses.map((course) => ({ id: course.id, label: course.code }))].map((item) => (
            <Pressable key={item.id} onPress={() => setCourseId(item.id)} style={[styles.chip, { borderColor: colors.line, backgroundColor: colors.surface }, courseId === item.id && { backgroundColor: `${colors.primary}12`, borderColor: colors.primary }]}>
              <Text style={[styles.chipText, { color: courseId === item.id ? colors.primary : colors.muted }]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
        <View style={styles.listHead}><Text style={[styles.section, { color: colors.text }]}>Danh sách bài tập</Text><Text style={[styles.count, { color: colors.muted }]}>{filtered.length} mục</Text></View>

        {filtered.map((item) => {
          const course = courseMap.get(item.courseId);
          const done = item.status === "completed";
          return (
            <Pressable key={item.id} onPress={() => router.push(`/assignments/${item.id}`)} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}> 
              <View style={[styles.dot, { backgroundColor: done ? `${colors.success}16` : colors.softBlue }]}><Text style={styles.emoji}>📘</Text></View>
              <View style={styles.info}>
                <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.meta, { color: colors.muted }]}>{course?.code ?? ""} · Hạn {formatDue(item.dueAt)}</Text>
                <Text style={[styles.status, { color: done ? colors.success : colors.error }]}>{done ? "Đã hoàn thành" : "Chưa hoàn thành"}</Text>
              </View>
              <Pressable onPress={() => void toggleStatus(item)} hitSlop={8}>
                <Ionicons name={done ? "checkbox" : "square-outline"} size={21} color={done ? colors.success : colors.muted} />
              </Pressable>
            </Pressable>
          );
        })}

        {filtered.length === 0 ? <EmptyState title="Không có bài tập" message={assignments.length ? "Thử đổi bộ lọc hoặc từ khóa." : "Tạo bài tập đầu tiên bằng nút +."} /> : null}
      </ScrollView>
      <AssignmentFormModal visible={modal} onClose={() => setModal(false)} courses={courses} editing={editing} onSaved={saveLocal} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, content: { padding: 20, paddingBottom: 30 }, center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 }, muted: { fontSize: 11, marginTop: 4 }, head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, title: { fontSize: 25, fontWeight: "800" }, add: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" }, search: { height: 46, borderWidth: 1, borderRadius: 12, marginTop: 18, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 8 }, input: { flex: 1, fontSize: 11 }, segment: { flexDirection: "row", gap: 7, marginTop: 12 }, segmentItem: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" }, segmentText: { fontSize: 9, fontWeight: "700" }, filterRow: { gap: 8, paddingVertical: 12 }, chip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9 }, chipText: { fontSize: 9, fontWeight: "700" }, error: { fontSize: 10, marginTop: 2 }, listHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, marginBottom: 10 }, section: { fontSize: 15, fontWeight: "800" }, count: { fontSize: 10 }, card: { borderWidth: 1, borderRadius: 14, padding: 13, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 9 }, dot: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" }, emoji: { fontSize: 17 }, info: { flex: 1 }, taskTitle: { fontSize: 12, fontWeight: "700" }, meta: { fontSize: 10, marginTop: 4 }, status: { fontSize: 9, fontWeight: "800", marginTop: 5 },
});
