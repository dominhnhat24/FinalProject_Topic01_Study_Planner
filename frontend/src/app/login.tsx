import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!email.trim() || !password) return setError("Vui lòng nhập email và mật khẩu.");
    setSubmitting(true);
    try { await login({ email: email.trim(), password, remember }); router.replace("/tabs"); }
    catch (err) { setError(err instanceof Error ? err.message : "Đăng nhập thất bại."); }
    finally { setSubmitting(false); }
  };

  return (
    <KeyboardAvoidingView style={[styles.screen, { backgroundColor: colors.bg }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.imageContainer}>
          <Ionicons name="school-outline" size={55} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Đăng nhập</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Chào mừng trở lại!{`\n`}Đăng nhập để tiếp tục.</Text>

        <View style={[styles.field, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <Ionicons name="mail-outline" size={18} color={colors.muted} />
          <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} style={[styles.input, { color: colors.text }]} />
        </View>

        <View style={[styles.field, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Mật khẩu" placeholderTextColor={colors.muted} secureTextEntry={!showPassword} style={[styles.input, { color: colors.text }]} />
          <Pressable onPress={() => setShowPassword((value) => !value)}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={colors.muted} />
          </Pressable>
        </View>

        <View style={styles.row}>
          <Pressable onPress={() => setRemember((value) => !value)} style={styles.remember}>
            <Ionicons name={remember ? "checkbox" : "square-outline"} size={19} color={remember ? colors.primary : colors.muted} />
            <Text style={[styles.rememberText, { color: colors.muted }]}>Ghi nhớ đăng nhập</Text>
          </Pressable>
          <Text style={[styles.forgot, { color: colors.primary }]}>Quên mật khẩu?</Text>
        </View>

        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <Pressable disabled={submitting} onPress={() => void submit()} style={[styles.primary, { backgroundColor: colors.primary }, submitting && { opacity: .7 }]}>
          {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryText}>Đăng nhập</Text>}
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>Chưa có tài khoản?</Text>
          <Link href="/register" style={[styles.link, { color: colors.primary }]}>Đăng ký</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 24, paddingTop: 40, flexGrow: 1 },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  imageContainer: { alignItems: "center", marginBottom: 15 },
  title: { fontSize: 30, fontWeight: "800" },
  subtitle: { fontSize: 12, lineHeight: 19, marginTop: 6, marginBottom: 20 },
  field: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 12 },
  input: { flex: 1, fontSize: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 6 },
  remember: { flexDirection: "row", alignItems: "center", gap: 6 },
  rememberText: { fontSize: 10 },
  forgot: { fontSize: 10, fontWeight: "700" },
  error: { fontSize: 11, marginVertical: 9 },
  primary: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 10 },
  primaryText: { color: "#FFF", fontWeight: "800", fontSize: 12 },
  footer: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 24 },
  footerText: { fontSize: 11 },
  link: { fontSize: 11, fontWeight: "800" },
});