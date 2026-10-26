import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { apiRequest, queueMutation, NetworkError } from "../services/api";
import { scheduleAssignmentReminders } from "../services/notifications";
import type { Assignment, Course } from "../types/api";
import { router } from "expo-router";

export function AssignmentFormModal({ visible, onClose, courses, editing, onSaved }: {
  visible: boolean;
  onClose: () => void;
  courses: Course[];
  editing: Assignment | null;
  onSaved: (assignment: Assignment) => void;
}) {
  const { colors } = useTheme();
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"pending" | "completed">("pending");
  const [attachments, setAttachments] = useState<Assignment["attachments"]>([]);
  const [coursePickerOpen, setCoursePickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    setCourseId(editing?.courseId ?? courses[0]?.id ?? "");
    setTitle(editing?.title ?? "");
    setDueAt(editing ? editing.dueAt.slice(0, 16) : "");
    setNotes(editing?.notes ?? "");
    setStatus(editing?.status ?? "pending");
    setAttachments(editing?.attachments ?? []);
    setError("");
  }, [visible, editing, courses]);

  const addAssets = (assets: ImagePicker.ImagePickerAsset[]) => {
    const selected = assets.map((asset) => ({ uri: asset.uri, fileName: asset.fileName ?? `image-${Date.now()}.jpg` }));
    setAttachments((current) => [...current, ...selected].slice(0, 10));
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Bạn cần cấp quyền thư viện ảnh để chọn ảnh đính kèm.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsMultipleSelection: true, selectionLimit: 5, quality: 0.85 });
    if (!result.canceled) addAssets(result.assets);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Bạn cần cấp quyền camera để chụp ảnh đính kèm.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], allowsEditing: true, quality: 0.85 });
    if (!result.canceled) addAssets(result.assets);
  };

  const save = async () => {
    setError("");
    if (!courseId || !title.trim() || !dueAt) {
      setError("Vui lòng chọn học phần, nhập tiêu đề và hạn nộp.");
      return;
    }
    const parsedDue = new Date(dueAt);
    if (Number.isNaN(parsedDue.getTime())) {
      setError("Hạn nộp không hợp lệ. Hãy dùng dạng YYYY-MM-DDTHH:mm.");
      return;
    }
    const iso = parsedDue.toISOString();
    const body = { courseId, title: title.trim(), dueAt: iso, status, notes: notes.trim(), attachments };
    setSaving(true);
    try {
      let saved: Assignment;
      if (editing) {
        saved = await apiRequest<Assignment>(`/assignments/${editing.id}`, { method: "PATCH", body });
      } else {
        saved = await apiRequest<Assignment>("/assignments", { method: "POST", body });
      }
      try {
  await scheduleAssignmentReminders(saved);
} catch (notificationError) {
  console.warn(
    "Không thể lên lịch thông báo. Bỏ qua để không chặn thao tác lưu:",
    notificationError,
  );
}

onSaved(saved);
onClose();
    } catch (err) {
      if (err instanceof NetworkError) {
        const localId = editing?.id ?? `offline_${Date.now()}`;
        const path = editing ? `/assignments/${editing.id}` : "/assignments";
        await queueMutation({ method: editing ? "PATCH" : "POST", path, body, resource: "assignment", localId });
        const local: Assignment = {
          id: localId,
          userId: "offline",
          courseId,
          title: title.trim(),
          dueAt: iso,
          status,
          notes: notes.trim(),
          attachments,
        };
        onSaved(local);
        onClose();
      } else {
        setError(err instanceof Error ? err.message : "Không thể lưu bài tập.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>{editing ? "Chỉnh sửa bài tập" : "Tạo bài tập mới"}</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Dữ liệu được lưu trực tiếp vào API.</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}><Ionicons name="close" size={24} color={colors.muted} /></Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            <Text style={[styles.label, { color: colors.text }]}>Học phần *</Text>
            <Pressable
  onPress={() => setCoursePickerOpen((value) => !value)}
  style={[
    styles.selector,
    {
      borderColor: coursePickerOpen
        ? colors.primary
        : colors.line,
      backgroundColor: colors.bg,
    },
  ]}
>
  <View style={styles.selectorTextWrap}>
    <Text
      style={[
        styles.selectorCode,
        {
          color: courseId
            ? colors.primary
            : colors.muted,
        },
      ]}
    >
      {courses.find((course) => course.id === courseId)?.code ?? ""}
    </Text>

    <Text
      style={[
        styles.selectorText,
        {
          color: courseId
            ? colors.text
            : colors.muted,
        },
      ]}
      numberOfLines={1}
    >
      {courses.find((course) => course.id === courseId)?.name ??
        "Chọn học phần"}
    </Text>
  </View>

  <Ionicons
    name={coursePickerOpen ? "chevron-up" : "chevron-down"}
    size={18}
    color={colors.muted}
  />
</Pressable>

{coursePickerOpen && courses.length > 0 ? (
  <View
    style={[
      styles.inlinePicker,
      {
        backgroundColor: colors.surface,
        borderColor: colors.line,
      },
    ]}
  >
    {courses.map((course) => {
      const selected = course.id === courseId;

      return (
        <Pressable
          key={course.id}
          onPress={() => {
            setCourseId(course.id);
            setCoursePickerOpen(false);
          }}
          style={[
            styles.pickerItem,
            {
              borderColor: selected
                ? colors.primary
                : colors.line,
              backgroundColor: selected
                ? colors.softBlue
                : colors.bg,
            },
          ]}
        >
          <View style={styles.pickerItemText}>
            <Text
              style={[
                styles.pickerCode,
                {
                  color: selected
                    ? colors.primary
                    : colors.muted,
                },
              ]}
            >
              {course.code}
            </Text>

            <Text
              style={[
                styles.pickerName,
                { color: colors.text },
              ]}
              numberOfLines={2}
            >
              {course.name}
            </Text>
          </View>

          {selected ? (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.primary}
            />
          ) : null}
        </Pressable>
      );
    })}
  </View>
) : null}
            {courses.length === 0 ? <Text style={[styles.helper, { color: colors.warning }]}>Chưa có học phần. Hãy tạo học phần trước khi tạo bài tập.</Text> : null}

            <Text style={[styles.label, { color: colors.text }]}>Tiêu đề *</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="Nhập tiêu đề bài tập" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, borderColor: colors.line, backgroundColor: colors.bg }]} />

            <Text style={[styles.label, { color: colors.text }]}>Hạn nộp * (YYYY-MM-DDTHH:mm)</Text>
            <TextInput value={dueAt} onChangeText={setDueAt} placeholder="2026-10-28T09:00" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, borderColor: colors.line, backgroundColor: colors.bg }]} />

            <Text style={[styles.label, { color: colors.text }]}>Trạng thái</Text>
            <View style={styles.rowGap}>
              {([["pending", "Chưa hoàn thành"], ["completed", "Đã hoàn thành"]] as const).map(([value, label]) => (
                <Pressable key={value} onPress={() => setStatus(value)} style={[styles.statusChoice, { borderColor: colors.line }, status === value && { borderColor: colors.primary }]}>
                  <Ionicons name={status === value ? "radio-button-on" : "radio-button-off"} size={17} color={status === value ? colors.primary : colors.muted} />
                  <Text style={[styles.choiceText, { color: colors.text }]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Ghi chú</Text>
            <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={4} textAlignVertical="top" placeholder="Ghi chú tùy chọn" placeholderTextColor={colors.muted} style={[styles.input, styles.notes, { color: colors.text, borderColor: colors.line, backgroundColor: colors.bg }]} />

            <View style={styles.attachmentHeader}>
              <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>Tệp đính kèm ({attachments.length})</Text>
              <View style={styles.attachmentActions}>
                <Pressable onPress={() => void takePhoto()} style={[styles.smallButton, { backgroundColor: colors.softBlue }]}>
                  <Ionicons name="camera-outline" size={16} color={colors.primary} />
                  <Text style={[styles.smallText, { color: colors.primary }]}>Chụp ảnh</Text>
                </Pressable>
                <Pressable onPress={() => void pickImages()} style={[styles.smallButton, { backgroundColor: colors.softBlue }]}>
                  <Ionicons name="image-outline" size={16} color={colors.primary} />
                  <Text style={[styles.smallText, { color: colors.primary }]}>Thư viện</Text>
                </Pressable>
              </View>
            </View>
            {attachments.map((attachment, index) => (
              <View key={`${attachment.uri}-${index}`} style={[styles.attachment, { borderColor: colors.line, backgroundColor: colors.bg }]}>
                <Ionicons name="image" size={17} color={colors.success} />
                <Text style={[styles.attachmentText, { color: colors.text }]} numberOfLines={1}>{attachment.fileName ?? attachment.uri}</Text>
                <Pressable onPress={() => setAttachments((current) => current.filter((_, i) => i !== index))}><Ionicons name="close-circle" size={18} color={colors.muted} /></Pressable>
              </View>
            ))}

            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

            <View style={styles.actions}>
              <Pressable onPress={onClose} style={[styles.secondaryButton, { borderColor: colors.line }]}><Text style={[styles.secondaryText, { color: colors.text }]}>Hủy</Text></Pressable>
              <Pressable disabled={saving} onPress={() => void save()} style={[styles.primaryButton, { backgroundColor: colors.primary }, saving && { opacity: 0.7 }]}>
                {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Lưu</Text>}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorTextWrap: {
  flex: 1,
  minWidth: 0,
},

selectorCode: {
  fontSize: 9,
  fontWeight: "800",
  marginBottom: 2,
},

attachmentActions: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

inlinePicker: {
  borderWidth: 1,
  borderRadius: 12,
  padding: 8,
  marginTop: 8,
  gap: 8,
},

createCourseButton: {
  minHeight: 42,
  borderRadius: 10,
  paddingHorizontal: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  marginTop: 10,
},

createCourseText: {
  fontSize: 11,
  fontWeight: "800",
},
  overlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.35)", justifyContent: "flex-end" },
  sheet: { maxHeight: "92%", borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 8 },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 10 },
  header: { paddingHorizontal: 20, paddingVertical: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { fontSize: 11, marginTop: 4 },
  body: { padding: 20, paddingTop: 4, paddingBottom: 36 },
  label: { fontSize: 11, fontWeight: "800", marginTop: 12, marginBottom: 8 },
  rowGap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selector: { minHeight: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  selectorText: { flex: 1, fontSize: 12, fontWeight: "600" },
  helper: { fontSize: 10, marginTop: 6 },
  choice: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, maxWidth: 200 },
  choiceText: { fontSize: 11, fontWeight: "700" },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, fontSize: 12 },
  notes: { minHeight: 96, paddingTop: 12 },
  statusChoice: { minHeight: 44, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8 },
  attachmentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  smallButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  smallText: { fontSize: 10, fontWeight: "700" },
  attachment: { padding: 10, borderWidth: 1, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  attachmentText: { flex: 1, fontSize: 10 },
  error: { fontSize: 11, lineHeight: 16, marginTop: 14 },
  actions: { flexDirection: "row", gap: 10, marginTop: 18 },
  secondaryButton: { flex: 1, height: 48, borderWidth: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  pickerOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.35)", justifyContent: "flex-end" },
  pickerSheet: { maxHeight: "70%", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 20 },
  pickerHeader: { paddingHorizontal: 20, paddingVertical: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pickerTitle: { fontSize: 18, fontWeight: "800" },
  pickerList: { paddingHorizontal: 20, gap: 9, paddingBottom: 10 },
  pickerItem: { minHeight: 58, borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pickerItemText: { flex: 1, paddingRight: 10 },
  pickerCode: { fontSize: 9, fontWeight: "800", marginBottom: 3 },
  pickerName: { fontSize: 12, fontWeight: "700" },
  primaryButton: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  secondaryText: { fontSize: 12, fontWeight: "800" },
  primaryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
});
