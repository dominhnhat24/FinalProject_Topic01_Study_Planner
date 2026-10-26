import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export function EmptyState({ title, message, icon = "file-tray-outline" }: { title: string; message: string; icon?: keyof typeof Ionicons.glyphMap }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      <Ionicons name={icon} size={34} color={colors.muted} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { padding: 28, borderWidth: 1, borderRadius: 18, alignItems: "center", gap: 9, marginBottom: 16 },
  title: { fontSize: 14, fontWeight: "800" },
  message: { textAlign: "center", fontSize: 11, lineHeight: 17 },
});
