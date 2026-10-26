import { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function WelcomeScreen() {
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (isAuthenticated && !loading) router.replace("/tabs");
  }, [isAuthenticated, loading]);

  if (isAuthenticated) return <Redirect href="/tabs" />;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.illustration, { backgroundColor: `${colors.primary}14` }]}>
        <View style={styles.books}>
          <View style={[styles.book, { backgroundColor: colors.primary }]} />
          <View style={[styles.book, styles.bookTwo, { backgroundColor: colors.secondary }]} />
          <View style={[styles.book, styles.bookThree, { backgroundColor: colors.success }]} />
        </View>
        <View style={[styles.laptop, { backgroundColor: colors.primary }]}><Ionicons name="laptop-outline" size={54} color="#FFFFFF" /></View>
        <View style={[styles.plant, { borderColor: colors.success }]}><Ionicons name="leaf-outline" size={42} color={colors.success} /></View>
      </View>

      <View style={styles.copy}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}><Ionicons name="checkbox" size={27} color="#FFFFFF" /></View>
        <Text style={[styles.title, { color: colors.text }]}>Study Planner</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Plan your study, achieve your goals</Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={() => router.push("/login")} style={[styles.primary, { backgroundColor: colors.primary }]}><Text style={styles.primaryText}>Đăng nhập</Text></Pressable>
        <Pressable onPress={() => router.push("/register")} style={[styles.outline, { borderColor: colors.primary }]}><Text style={[styles.outlineText, { color: colors.primary }]}>Đăng ký</Text></Pressable>
        <Pressable onPress={() => router.push("/login")} style={styles.skip}><Text style={[styles.skipText, { color: colors.muted }]}>Bỏ qua</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "space-between", padding: 20, paddingTop: 50, paddingBottom: 35 },
  illustration: { height: Dimensions.get("window").height * 0.38, borderRadius: 28, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  copy: { alignItems: "center", marginTop: 12 },
  logo: { width: 62, height: 62, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 13 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 7 },
  actions: { gap: 10 },
  primary: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  outline: { height: 50, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  outlineText: { fontSize: 12, fontWeight: "800" },
  skip: { height: 38, alignItems: "center", justifyContent: "center" },
  skipText: { fontSize: 11, fontWeight: "700" },
  books: { position: "absolute", bottom: 30, left: 25 },
  book: { width: 120, height: 24, borderRadius: 5, transform: [{ rotate: "-8deg" }] },
  bookTwo: { marginTop: -2, transform: [{ rotate: "5deg" }] },
  bookThree: { marginTop: -2, width: 90, transform: [{ rotate: "-2deg" }] },
  laptop: { width: 132, height: 90, borderRadius: 13, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10, elevation: 5 },
  plant: { position: "absolute", right: 24, bottom: 35 },
});
