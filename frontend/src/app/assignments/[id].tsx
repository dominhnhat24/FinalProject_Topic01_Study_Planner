import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { apiRequest, NetworkError, queueMutation, scopedCacheKey } from "../../services/api";
import { readCache, writeCache } from "../../services/offline";
import { cancelAssignmentReminders, scheduleAssignmentReminders } from "../../services/notifications";
import type { Assignment, Course } from "../../types/api";
import { useAuth } from "../../context/AuthContext";
import { formatInTimezone } from "../../utils/date";

function dueInfo(value: string, timezone: string) {
  const due = new Date(value);
  const diff = Math.max(0, due.getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return {
    date: formatInTimezone(value, timezone, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    remaining: days > 0 ? `Còn ${days} ngày ${hours} giờ` : hours > 0 ? `Còn ${hours} giờ` : `Sắp đến hạn`
  };
}

export default function AssignmentDetailScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [a, c] = await Promise.all([
        apiRequest<Assignment>(`/assignments/${id}`),
        apiRequest<Course[]>("/courses")
      ]);
      setAssignment(a);
      setCourses(c);
    } catch (err) {
      const cached = await readCache<{ items: Assignment[] }>(await scopedCacheKey("/assignments?limit=100&page=1"));
      const local = cached?.items.find(item => item.id === id);
      if (local) setAssignment(local);
      else setError(err instanceof Error ? err.message : "Không thể tải bài tập.");
    }
  }, [id]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  const course = useMemo(() => courses.find(c => c.id === assignment?.courseId), [courses, assignment]);

  const toggle = async () => {
    if (!assignment) return;
    const before = assignment;
    const next = { ...assignment, status: assignment.status === "completed" ? "pending" : "completed" } as Assignment;
    setAssignment(next);
    try {
      const updated = await apiRequest<Assignment>(`/assignments/${id}`, {
        method: "PATCH",
        body: { status: next.status }
      });
      setAssignment(updated);
      await scheduleAssignmentReminders(updated);
    } catch (err) {
      if (err instanceof NetworkError) {
        await queueMutation({
          method: "PATCH",
          path: `/assignments/${id}`,
          body: { status: next.status },
          resource: "assignment",
          localId: id
        });
        return;
      }
      setAssignment(before);
      setError(err instanceof Error ? err.message : "Không thể cập nhật.");
    }
  };

  const deleteItem = () => {
    if (!assignment) return;
    Alert.alert("Xóa bài tập", "Bạn có chắc muốn xóa bài tập này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await apiRequest(`/assignments/${id}`, { method: "DELETE" });
            await cancelAssignmentReminders(assignment.id, assignment.userId);
            const cacheKey = await scopedCacheKey("/assignments?limit=100&page=1");
            const cached = await readCache<{ items: Assignment[]; pagination: any }>(cacheKey);
            if (cached) {
              const items = cached.items.filter((item) => item.id !== id);
              await writeCache(cacheKey, {
                ...cached,
                items,
                pagination: { ...cached.pagination, total: items.length, totalPages: items.length ? 1 : 0 }
              });
            }
            router.back();
          } catch (err) {
            if (err instanceof NetworkError) {
              await queueMutation({ method: "DELETE", path: `/assignments/${id}`, resource: "assignment", localId: id });
              await cancelAssignmentReminders(assignment.id, assignment.userId);
              router.back();
            } else setError(err instanceof Error ? err.message : "Không thể xóa.");
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.muted, { color: colors.muted }]}>Đang tải bài tập...</Text>
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.primary || '#D63031'} />
        <Text style={[styles.title, { color: colors.text }]}>Không tìm thấy bài tập</Text>
        <Pressable onPress={() => router.replace("/tabs/assignments")} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.primaryText}>Quay lại danh sách</Text>
        </Pressable>
      </View>
    );
  }

  const info = dueInfo(assignment.dueAt, user?.timezone ?? "Asia/Ho_Chi_Minh");
  const done = assignment.status === "completed";

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      {/* Header điều hướng */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.circleBtn, { backgroundColor: colors.card || '#FFF' }]}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={deleteItem} style={[styles.circleBtn, { backgroundColor: '#FFE5E5' }]}>
            <Ionicons name="trash-outline" size={18} color="#D63031" />
          </Pressable>
          <Pressable onPress={() => router.push({ pathname: "/tabs/assignments", params: { edit: id } })} style={[styles.circleBtn, { backgroundColor: colors.card || '#FFF' }]}>
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Thông tin chính bài tập */}
      <View style={[styles.mainCard, { backgroundColor: colors.card || '#FFF' }]}>
        <View style={styles.topRow}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="book" size={22} color={colors.primary} />
          </View>
          <View style={[styles.statusChip, { backgroundColor: done ? '#E3FCF7' : '#FFF4E5' }]}>
            <Text style={[styles.statusText, { color: done ? '#00B894' : '#E17055' }]}>
              {done ? "Đã hoàn thành" : "Chưa hoàn thành"}
            </Text>
          </View>
        </View>

        <Text style={[styles.courseCode, { color: colors.primary }]}>{course?.code ?? "MÔN HỌC"} · {course?.name ?? ""}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{assignment.title}</Text>
      </View>

      {/* Thẻ hạn nộp */}
      <View style={[styles.dueCard, { backgroundColor: colors.card || '#FFF', borderColor: colors.border || '#EDF2F7' }]}>
        <View style={[styles.calendarIcon, { backgroundColor: `${colors.primary}12` }]}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.dueLabel, { color: colors.muted }]}>Hạn nộp bài</Text>
          <Text style={[styles.dueDate, { color: colors.text }]}>{info.date}</Text>
        </View>
        <View style={[styles.remainingBadge, { backgroundColor: done ? '#E3FCF7' : '#FFF4E5' }]}>
          <Text style={[styles.remainingText, { color: done ? '#00B894' : '#E17055' }]}>
            {done ? "Hoàn thành" : info.remaining}
          </Text>
        </View>
      </View>

      {/* Mô tả / Ghi chú */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Mô tả chi tiết</Text>
      <View style={[styles.box, { backgroundColor: colors.card || '#FFF', borderColor: colors.border || '#EDF2F7' }]}>
        <Text style={[styles.body, { color: assignment.notes ? colors.text : colors.muted }]}>
          {assignment.notes || "Chưa có mô tả hoặc ghi chú cho bài tập này."}
        </Text>
      </View>

      {/* Tệp đính kèm */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Tệp đính kèm ({assignment.attachments.length})</Text>
      {assignment.attachments.length > 0 ? (
        assignment.attachments.map((file, index) => (
          <View key={`${file.uri}-${index}`} style={[styles.fileCard, { backgroundColor: colors.card || '#FFF', borderColor: colors.border || '#EDF2F7' }]}>
            {file.uri.startsWith("http") || file.uri.startsWith("file") ? (
              <Image source={{ uri: file.uri }} style={styles.thumb} />
            ) : (
              <Ionicons name="document-text-outline" size={24} color={colors.primary} />
            )}
            <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
              {file.fileName ?? `Tệp đính kèm ${index + 1}`}
            </Text>
          </View>
        ))
      ) : (
        <Text style={[styles.mutedText, { color: colors.muted }]}>Không có tệp đính kèm nào.</Text>
      )}

      {/* Nút thao tác hoàn thành */}
      <Pressable onPress={() => void toggle()} style={[styles.completeBtn, { backgroundColor: done ? colors.card || '#FFF' : colors.primary, borderColor: colors.primary }]}>
        <Ionicons name={done ? "checkmark-circle" : "checkmark-circle-outline"} size={20} color={done ? colors.primary : "#FFF"} />
        <Text style={[styles.completeText, { color: done ? colors.primary : "#FFF" }]}>
          {done ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 30 },
  muted: { fontSize: 13, textAlign: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  circleBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  headerActions: { flexDirection: "row", gap: 10 },
  mainCard: { borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statusChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },
  courseCode: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: "800", lineHeight: 28 },
  dueCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 12 },
  calendarIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  dueLabel: { fontSize: 11 },
  dueDate: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  remainingBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  remainingText: { fontSize: 10, fontWeight: "700" },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8, marginTop: 12 },
  box: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 12 },
  body: { fontSize: 14, lineHeight: 20 },
  fileCard: { borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  thumb: { width: 40, height: 40, borderRadius: 8 },
  fileName: { flex: 1, fontSize: 13, fontWeight: "600" },
  mutedText: { fontSize: 13, fontStyle: "italic", marginBottom: 12 },
  completeBtn: { height: 50, borderWidth: 1, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 24, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  completeText: { fontSize: 14, fontWeight: "700" },
  primaryBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 12 },
  primaryText: { color: "#FFF", fontWeight: "700", fontSize: 14 }
});