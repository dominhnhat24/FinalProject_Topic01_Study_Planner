// frontend/src/app/forgot-password.tsx
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { apiRequest } from "../services/api";

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email đăng ký tài khoản.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Gọi API yêu cầu cấp lại mật khẩu từ Backend
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: { email: email.trim() },
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Sửa lại nút quay về dùng router.replace để không bị lỗi lịch sử điều hướng */}
      <Pressable onPress={() => router.replace("/login")} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </Pressable>

      <View style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
          <Ionicons name="key-outline" size={36} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Quên mật khẩu?</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
        </Text>

        {success ? (
          <View style={[styles.successBox, { backgroundColor: `${colors.success || '#00B894'}15`, borderColor: colors.success || '#00B894' }]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success || '#00B894'} />
            <Text style={[styles.successText, { color: colors.success || '#00B894' }]}>
              Đã gửi yêu cầu! Vui lòng kiểm tra hộp thư email của bạn.
            </Text>
          </View>
        ) : (
          <>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.muted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email của bạn..."
                placeholderTextColor={colors.muted}
                style={[styles.input, { color: colors.text }]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              onPress={handleResetPassword}
              disabled={loading}
              style={[styles.button, { backgroundColor: colors.primary }]}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Gửi yêu cầu</Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  backButton: { width: 40, height: 40, justifyContent: "center", marginTop: 20 },
  content: { flex: 1, justifyContent: "center", maxWidth: 400, width: "100%", alignSelf: "center", marginTop: -60 },
  iconBox: { width: 70, height: 70, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  inputContainer: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  input: { flex: 1, fontSize: 14 },
  errorText: { color: "#D63031", fontSize: 12, marginBottom: 12 },
  button: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 8 },
  buttonText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  successBox: { borderWidth: 1, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 },
  successText: { flex: 1, fontSize: 13, fontWeight: "600" }
});