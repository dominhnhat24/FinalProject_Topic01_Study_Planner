import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { apiRequest, NetworkError, queueMutation } from "../services/api";
import type { Course } from "../types/api";

const COLORS = ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#0EA5E9"];

export function CourseFormModal({ visible, onClose, editing, onSaved }: { visible: boolean; onClose: () => void; editing: Course | null; onSaved: (course: Course) => void }) {
  const { colors } = useTheme();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    setCode(editing?.code ?? "");
    setName(editing?.name ?? "");
    setColor(editing?.color ?? COLORS[0]);
    setError("");
  }, [visible, editing]);

  const save = async () => {
    setError("");
    if (!code.trim() || !name.trim()) return setError("Vui lòng nhập mã và tên học phần.");
    setSaving(true);
    const body = { code: code.trim().toUpperCase(), name: name.trim(), color };
    try {
      const saved = editing
        ? await apiRequest<Course>(`/courses/${editing.id}`, { method: "PATCH", body })
        : await apiRequest<Course>("/courses", { method: "POST", body });
      onSaved(saved);
      onClose();
    } catch (err) {
      if (err instanceof NetworkError) {
        const localId = editing?.id ?? `offline_course_${Date.now()}`;
        await queueMutation({ method: editing ? "PATCH" : "POST", path: editing ? `/courses/${editing.id}` : "/courses", body, resource: "course", localId });
        onSaved({ id: localId, userId: "offline", ...body });
        onClose();
      } else setError(err instanceof Error ? err.message : "Không thể lưu học phần.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={styles.handle} />
          <View style={styles.header}><Text style={[styles.title, { color: colors.text }]}>{editing ? "Chỉnh sửa học phần" : "Tạo học phần mới"}</Text><Pressable onPress={onClose}><Ionicons name="close" size={24} color={colors.muted} /></Pressable></View>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={[styles.label, { color: colors.text }]}>Mã học phần *</Text>
            <TextInput value={code} onChangeText={setCode} placeholder="MOB401" placeholderTextColor={colors.muted} autoCapitalize="characters" style={[styles.input, { color: colors.text, borderColor: colors.line, backgroundColor: colors.bg }]} />
            <Text style={[styles.label, { color: colors.text }]}>Tên học phần *</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Mobile App Development" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, borderColor: colors.line, backgroundColor: colors.bg }]} />
            <Text style={[styles.label, { color: colors.text }]}>Màu</Text>
            <View style={styles.colors}>{COLORS.map((item) => <Pressable key={item} onPress={() => setColor(item)} style={[styles.swatch, { backgroundColor: item }, color === item && styles.selected]} />)}</View>
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
            <View style={styles.actions}><Pressable onPress={onClose} style={[styles.button, { borderColor: colors.line }]}><Text style={[styles.secondaryText, { color: colors.text }]}>Hủy</Text></Pressable><Pressable onPress={() => void save()} disabled={saving} style={[styles.button, { backgroundColor: colors.primary }, saving && { opacity: 0.7 }]}>{saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryText}>Lưu</Text>}</Pressable></View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15,23,42,.4)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: "82%", paddingTop: 8 },
  handle: { width: 40, height: 5, borderRadius: 4, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 8 },
  header: { padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "800" },
  body: { paddingHorizontal: 20, paddingBottom: 32 },
  label: { fontSize: 11, fontWeight: "800", marginTop: 10, marginBottom: 8 },
  input: { height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, fontSize: 12 },
  colors: { flexDirection: "row", gap: 12 },
  swatch: { width: 34, height: 34, borderRadius: 17 },
  selected: { borderWidth: 3, borderColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: .2, shadowRadius: 4, elevation: 3 },
  error: { fontSize: 11, marginTop: 13 },
  actions: { flexDirection: "row", gap: 10, marginTop: 22 },
  button: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  secondaryText: { fontSize: 12, fontWeight: "800" },
  primaryText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
});
