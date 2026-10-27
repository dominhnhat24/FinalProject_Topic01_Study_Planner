// frontend/src/app/tabs/assignments.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { AssignmentFormModal } from "../../components/AssignmentFormModal";
import { AssignmentCard } from "../../components/AssignmentCard";
import { EmptyState } from "../../components/EmptyState";
import { useTheme } from "../../context/ThemeContext";
import { apiRequest, NetworkError, queueMutation, scopedCacheKey } from "../../services/api";
import { writeCache } from "../../services/offline";
import { scheduleAssignmentReminders } from "../../services/notifications";
import type { Assignment, Course } from "../../types/api";

type StatusFilter = "all" | "pending" | "completed";

function formatDue(value: string) {
  try {
    return new Date(value).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return value;
  }
}

export default function AssignmentsScreen() {
  const { colors } = useTheme();
  const { edit, filter } = useLocalSearchParams<{ edit?: string; filter?: string }>();
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
      setAssignments(assignmentData.items || []);
      setCourses(courseData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải bài tập.");
      throw err;
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  // Theo dõi tham số edit để mở modal
  useEffect(() => {
    if (edit && assignments.length) {
      const target = assignments.find((item) => item.id === edit);
      if (target) { 
        setEditing(target); 
        setModal(true); 
      }
    } else if (!edit) {
      setModal(false);
      setEditing(null);
    }
  }, [edit, assignments]);

  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  
  // Logic lọc và sắp xếp bài tập (Bài sắp hết hạn lên đầu)
  const filtered = useMemo(() => {
    const result = assignments.filter((item) => {
      if (filter === "48h") {
        if (!item.dueAt) return false;
        
        const now = Date.now();
        const targetTime = now + 48 * 60 * 60 * 1000;
        
        let dueTime = new Date(item.dueAt).getTime();
        if (isNaN(dueTime)) {
          dueTime = new Date(item.dueAt.replace(" ", "T")).getTime();
        }

        if (isNaN(dueTime)) return false;
        if (dueTime < now || dueTime > targetTime) return false;
      }

      const matchesStatus = status === "all" || item.status === status;
      const matchesCourse = courseId === "all" || item.courseId === courseId;
      const matchesSearch = !search.trim() || item.title.toLowerCase().includes(search.trim().toLowerCase());

      return matchesStatus && matchesCourse && matchesSearch;
    });

    return result.sort((a, b) => {
      const timeA = a.dueAt ? new Date(a.dueAt).getTime() : 0;
      const timeB = b.dueAt ? new Date(b.dueAt).getTime() : 0;
      return timeA - timeB;
    });
  }, [assignments, status, courseId, search, filter]);

  const saveLocal = (next: Assignment) => {
    setAssignments((current) => {
      const updated = current.some((item) => item.id === next.id)
        ? current.map((item) => (item.id === next.id ? next : item))
        : [...current, next];
      void scopedCacheKey("/assignments?limit=100&page=1").then((key) => writeCache(key, {
        items: updated,
        pagination: { page: 1, limit: 100, total: updated.length, totalPages: 1 },
      }));
      return updated;
    });
  };

  const toggleStatus = async (item: Assignment) => {
    const previous = item;
    const nextStatus = item.status === "completed" ? "pending" : "completed";
    const next: Assignment = { ...item, status: nextStatus };
    saveLocal(next);
    try {
      const updated = await apiRequest<Assignment>(`/assignments/${item.id}`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      saveLocal(updated);
      await scheduleAssignmentReminders(updated);
    } catch (err) {
      if (err instanceof NetworkError) {
        await queueMutation({
          method: "PATCH",
          path: `/assignments/${item.id}`,
          body: { status: nextStatus },
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
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={[styles.screen, { backgroundColor: colors.bg }]}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); void load().finally(() => setRefreshing(false)); }} 
            tintColor={colors.primary} 
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.head}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  {filter === "48h" ? "Bài tập 48 giờ tới" : "Quản lý Bài tập"}
                </Text>
                <Text style={[styles.muted, { color: colors.muted }]}>
                  {filter === "48h" ? "Đang lọc các bài sắp đến hạn." : "Danh sách đồng bộ thời gian thực."}
                </Text>
              </View>
              <View style={styles.headerRightActions}>
                {filter === "48h" && (
                  <Pressable
                    onPress={() => router.setParams({ filter: undefined })}
                    style={[styles.clearFilterBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                  >
                    <Text style={[styles.clearFilterText, { color: colors.primary }]}>Xem tất cả</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => {
                    setEditing(null);
                    setModal(true);
                  }}
                  hitSlop={8}
                >
                  <Ionicons name="add-circle" size={38} color={colors.primary} />
                </Pressable>
              </View>
            </View>

            <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}> 
              <Ionicons name="search-outline" size={18} color={colors.muted} />
              <TextInput 
                value={search} 
                onChangeText={setSearch} 
                placeholder="Tìm kiếm bài tập..." 
                placeholderTextColor={colors.muted} 
                style={[styles.input, { color: colors.text }]} 
              />
            </View>

            <View style={styles.segment}>
              {([["all", "Tất cả"], ["pending", "Chưa xong"], ["completed", "Đã xong"]] as const).map(([value, label]) => (
                <Pressable 
                  key={value} 
                  onPress={() => setStatus(value)} 
                  style={[
                    styles.segmentItem, 
                    { borderColor: colors.border, backgroundColor: colors.card }, 
                    status === value && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                >
                  <Text style={[styles.segmentText, { color: status === value ? "#FFF" : colors.muted }]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {[{ id: "all", label: "Tất cả môn" }, ...courses.map((course) => ({ id: course.id, label: course.code }))].map((item) => (
                  <Pressable 
                    key={item.id} 
                    onPress={() => setCourseId(item.id)} 
                    style={[
                      styles.chip, 
                      { borderColor: colors.border, backgroundColor: colors.card }, 
                      courseId === item.id && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }
                    ]}
                  >
                    <Text style={[styles.chipText, { color: courseId === item.id ? colors.primary : colors.muted }]}>{item.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

          {error ? <Text style={[styles.error, { color: '#D63031' }]}>{error}</Text> : null}
            
            <View style={styles.listHead}>
              <Text style={[styles.section, { color: colors.text }]}>Danh sách</Text>
              <Text style={[styles.count, { color: colors.muted }]}>{filtered.length} mục</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const course = courseMap.get(item.courseId);
          const done = item.status === "completed";
          return (
            <AssignmentCard
              title={item.title}
              courseName={course?.name || course?.code || 'Môn học'}
              courseColor={course ? '#6C5CE7' : '#00CEC9'}
              dueDate={formatDue(item.dueAt)}
              priority="MEDIUM"
              isCompleted={done}
              onToggle={() => void toggleStatus(item)}
              onPress={() => router.push(`/assignments/${item.id}`)}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState 
            title="Không có bài tập nào" 
            message={filter === "48h" ? "Không có bài tập nào trong vòng 48 giờ tới." : (assignments.length ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm." : "Tạo bài tập đầu tiên bằng cách nhấn nút dấu cộng (+).")} 
          />
        }
      />
      
      {/* Ép đóng trực tiếp bằng state cục bộ */}
      <AssignmentFormModal 
        visible={modal} 
        onClose={() => {
          setModal(false);
          setEditing(null);
          router.replace({ pathname: "/tabs/assignments", params: filter ? { filter } : {} });
        }} 
        courses={courses} 
        editing={editing} 
        onSaved={(updatedItem) => {
          saveLocal(updatedItem);
          setModal(false);
          setEditing(null);
          router.replace({ pathname: "/tabs/assignments", params: filter ? { filter } : {} });
        }} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  muted: { fontSize: 12, marginTop: 4 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  headerRightActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  clearFilterBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  clearFilterText: { fontSize: 11, fontWeight: "700" },
  title: { fontSize: 24, fontWeight: "800" },
  search: { height: 48, borderWidth: 1, borderRadius: 12, marginTop: 16, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 8 },
  input: { flex: 1, fontSize: 14 },
  segment: { flexDirection: "row", gap: 8, marginTop: 14 },
  segmentItem: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  segmentText: { fontSize: 11, fontWeight: "700" },
  filterRow: { gap: 8, paddingVertical: 12 },
  chip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontSize: 11, fontWeight: "700" },
  error: { fontSize: 12, marginTop: 4 },
  listHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, marginBottom: 8 },
  section: { fontSize: 16, fontWeight: "800" },
  count: { fontSize: 12 },
});