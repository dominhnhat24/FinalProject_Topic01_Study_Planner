import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useOfflineQueueCount } from "../../components/useOfflineQueueCount";

export default function ProfileScreen() {
  const { colors, mode, toggle } = useTheme();
  const { user, logout } = useAuth() as { user: { name?: string; email?: string } | null, logout: () => Promise<void> };
  const [loggingOut, setLoggingOut] = useState(false);
  const pending = useOfflineQueueCount();

  const [showDetails, setShowDetails] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const doLogout = async () => { 
    setLoggingOut(true); 
    try {
      await logout(); 
    } catch {
      // Bỏ qua lỗi mạng khi logout
    } finally {
      router.replace("/login"); 
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Cá nhân</Text>
      
      <Pressable 
        onPress={() => setShowDetails(!showDetails)}
        style={[styles.profileCardInteractive, { backgroundColor: colors.surface, borderColor: colors.line }]}
      >
        <View style={[styles.avatar, { backgroundColor: `${colors.primary}18` }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {(user?.name ?? "Trịnh Quang Duy").slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.name ?? "Trịnh Quang Duy"}
          </Text>
          <Text style={[styles.email, { color: colors.muted }]}>
            {user?.email ?? "1923051143@student.hcmute.edu.vn"}
          </Text>
          <View style={[styles.idBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.idBadgeText, { color: colors.primary }]}>Mã SV: 1923051143</Text>
          </View>
        </View>
        <Ionicons name={showDetails ? "chevron-down" : "chevron-forward"} size={18} color={colors.muted} />
      </Pressable>

      {showDetails && (
        <View style={[styles.detailsBox, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <Text style={[styles.detailText, { color: colors.text }]}>📌 Trạng thái: Đang hoạt động (MongoDB Connected)</Text>
          <Text style={[styles.detailText, { color: colors.text }]}>🏫 Khoa: Công nghệ thông tin</Text>
          <Text style={[styles.detailText, { color: colors.text }]}>💻 Thư mục dự án: 12_trinhquangduy</Text>
        </View>
      )}

      {pending > 0 ? (
        <View style={[styles.sync, { backgroundColor: `${colors.warning}15`, borderColor: `${colors.warning}50` }]}>
          <Ionicons name="cloud-upload-outline" size={18} color={colors.warning} />
          <View style={styles.flex}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Có {pending} thay đổi chờ đồng bộ</Text>
            <Text style={[styles.rowSub, { color: colors.muted }]}>Ứng dụng sẽ gửi lại khi có mạng.</Text>
          </View>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <Pressable 
          onPress={() => router.push("/tabs/courses")} 
          style={[styles.row, { borderBottomColor: colors.line }]}
        >
          <Ionicons name="library-outline" size={20} color={colors.primary}/>
          <View style={styles.flex}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Học phần của tôi</Text>
            <Text style={[styles.rowSub, { color: colors.muted }]}>Quản lý danh sách môn học từ cơ sở dữ liệu</Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color={colors.muted}/>
        </Pressable>

        <View style={[styles.row, { borderBottomColor: colors.line }]}>
          <Ionicons name="notifications-outline" size={20} color={colors.primary}/>
          <View style={styles.flex}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Nhận thông báo deadline</Text>
            <Text style={[styles.rowSub, { color: colors.muted }]}>{notificationsEnabled ? "Đang bật" : "Đã tắt"}</Text>
          </View>
          <Switch 
            value={notificationsEnabled} 
            onValueChange={setNotificationsEnabled} 
            trackColor={{ false: colors.line, true: colors.primary }} 
            thumbColor="#FFFFFF" 
          />
        </View>

        <View style={styles.row}>
          <Ionicons name="color-palette-outline" size={20} color={colors.primary}/>
          <View style={styles.flex}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Giao diện</Text>
            <Text style={[styles.rowSub, { color: colors.muted }]}>{mode === "dark" ? "Chế độ tối" : "Chế độ sáng"}</Text>
          </View>
          <Switch 
            value={mode === "dark"} 
            onValueChange={() => void toggle()} 
            trackColor={{ false: colors.line, true: colors.primary }} 
            thumbColor="#FFFFFF" 
          />
        </View>
      </View>

      <Pressable 
        onPress={() => router.push("/tabs/assignments")} 
        style={[styles.widget, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}28` }]}
      >
        <Ionicons name="grid-outline" size={20} color={colors.primary}/>
        <View style={styles.flex}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>48 giờ tới</Text>
          <Text style={[styles.rowSub, { color: colors.muted }]}>Xem bài tập sắp đến hạn.</Text>
        </View>
        <Ionicons name="chevron-forward" size={17} color={colors.primary}/>
      </Pressable>

      <Pressable 
        onPress={() => void doLogout()} 
        disabled={loggingOut} 
        style={[styles.logout, { borderColor: `${colors.error}50`, backgroundColor: `${colors.error}08` }]}
      >
        <Ionicons name="log-out-outline" size={19} color={colors.error}/>
        <Text style={[styles.logoutText, { color: colors.error }]}>
          {loggingOut ? "Đang đăng xuất..." : "Đăng xuất tài khoản"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, 
  content: { padding: 20, paddingBottom: 35 }, 
  title: { fontSize: 25, fontWeight: "800", marginBottom: 15 }, 
  profileCardInteractive: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12, gap: 14 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" }, 
  avatarText: { fontSize: 22, fontWeight: "800" }, 
  name: { fontSize: 15, fontWeight: "800" }, 
  email: { fontSize: 11, marginTop: 2 }, 
  idBadge: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  idBadgeText: { fontSize: 10, fontWeight: "700" },
  detailsBox: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 16, gap: 6 },
  detailText: { fontSize: 12, fontWeight: "600" },
  sync: { borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }, 
  card: { borderWidth: 1, borderRadius: 17, overflow: "hidden" }, 
  row: { minHeight: 56, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1 }, 
  rowTitle: { fontSize: 12, fontWeight: "700" }, 
  rowSub: { fontSize: 10, marginTop: 2 }, 
  flex: { flex: 1 }, 
  widget: { borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 14, flexDirection: "row", alignItems: "center", gap: 11 }, 
  logout: { height: 48, borderWidth: 1, borderRadius: 12, marginTop: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, 
  logoutText: { fontSize: 12, fontWeight: "800" }
});