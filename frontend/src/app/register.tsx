import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { register } = useAuth();
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [confirm, setConfirm] = useState(""); 
  const [submitting, setSubmitting] = useState(false); 
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim() || !email.trim() || !password || !confirm) return setError("Vui lòng nhập đầy đủ thông tin.");
    if (password !== confirm) return setError("Mật khẩu xác nhận không khớp.");
    setSubmitting(true);
    try { 
      await register({ name: name.trim(), email: email.trim(), password }); 
      router.replace("/tabs"); 
    }
    catch (err) { 
      setError(err instanceof Error ? err.message : "Đăng ký thất bại."); 
    }
    finally { 
      setSubmitting(false); 
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.screen, { backgroundColor: colors.bg }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.imageContainer}>
          <Ionicons name="person-add-outline" size={55} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Tạo tài khoản</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Tạo tài khoản để lưu học phần, bài tập và deadline.</Text>

        {[{label:"Họ và tên", value:name, set:setName, placeholder:"Họ và tên của bạn"}, {label:"Email", value:email, set:setEmail, placeholder:"email@example.com"}, {label:"Mật khẩu", value:password, set:setPassword, placeholder:"Tối thiểu 8 ký tự", secure:true}, {label:"Xác nhận mật khẩu", value:confirm, set:setConfirm, placeholder:"Nhập lại mật khẩu", secure:true}].map((item) => (
          <View key={item.label}>
            <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
            <TextInput 
              value={item.value} 
              onChangeText={item.set} 
              placeholder={item.placeholder} 
              placeholderTextColor={colors.muted} 
              secureTextEntry={item.secure} 
              keyboardType={item.label === "Email" ? "email-address" : "default"} 
              autoCapitalize={item.label === "Email" ? "none" : undefined} 
              style={[styles.input, { color: colors.text, borderColor: colors.line, backgroundColor: colors.surface }]} 
            />
          </View>
        ))}

        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <Pressable onPress={() => void submit()} disabled={submitting} style={[styles.primary, { backgroundColor: colors.primary }]}>
          {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryText}>Đăng ký</Text>}
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>Đã có tài khoản?</Text>
          <Link href="/login" style={[styles.link, { color: colors.primary }]}>Đăng nhập</Link>
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
  subtitle: { fontSize: 12, lineHeight: 19, marginTop: 6, marginBottom: 18 },
  label: { fontSize: 11, fontWeight: "800", marginBottom: 6, marginTop: 6 },
  input: { height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 12 },
  error: { fontSize: 11, marginTop: 10 },
  primary: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 16 },
  primaryText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  footer: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 22 },
  footerText: { fontSize: 11 },
  link: { fontSize: 11, fontWeight: "800" }
});