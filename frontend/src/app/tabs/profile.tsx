import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { apiRequest } from "../../services/api";
import { cancelAssignmentRemindersForUser, configureNotifications, getScheduledAssignmentReminderCount, scheduleAssignmentReminders } from "../../services/notifications";
import type { Assignment } from "../../types/api";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useOfflineQueueCount } from "../../components/useOfflineQueueCount";

export default function ProfileScreen() {
  const { colors, mode, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const pending = useOfflineQueueCount();

  const [showDetails, setShowDetails] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState<boolean | null>(null);
  const [scheduledReminderCount, setScheduledReminderCount] = useState(0);
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [testNotificationBusy, setTestNotificationBusy] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    let active = true;
    const loadNotificationStatus = async () => {
      const stored = await AsyncStorage.getItem(`study_planner.notifications.${user?.id ?? "anonymous"}`).catch(() => null);
      if (Platform.OS === "web") {
        if (active) {
          setNotificationsEnabled(stored === "true");
          setNotificationPermissionGranted(false);
          setScheduledReminderCount(0);
        }
        return;
      }
      const setup = await configureNotifications(false);
      const count = await getScheduledAssignmentReminderCount(user?.id);
      if (active) {
        setNotificationsEnabled(stored === "true");
        setNotificationPermissionGranted(setup.granted);
        setScheduledReminderCount(count);
      }
    };
    void loadNotificationStatus();
    return () => { active = false; };
  }, [user?.id]);

  const changeNotifications = async (enabled: boolean) => {
    if (Platform.OS === "web") {
      setNotificationMessage("Nhắc deadline chỉ được hỗ trợ trên ứng dụng iOS/Android; trình duyệt web không lên lịch thông báo trong ứng dụng này.");
      return;
    }
    if (notificationBusy) return;
    setNotificationBusy(true);
    setNotificationMessage("");
    const storageKey = `study_planner.notifications.${user?.id ?? "anonymous"}`;
    try {
      if (enabled) {
        const setup = await configureNotifications(true);
        setNotificationPermissionGranted(setup.granted);
        if (!setup.granted) {
          setNotificationsEnabled(false);
          setNotificationMessage("Chưa bật được thông báo: hãy cấp quyền thông báo cho Study Planner trong Cài đặt iPhone/Android rồi thử lại.");
          return;
        }

        await AsyncStorage.setItem(storageKey, "true");
        setNotificationsEnabled(true);
        try {
          const result = await apiRequest<{ items: Assignment[] }>("/assignments?limit=100&page=1&status=pending", { skipCache: true });
          await Promise.all(result.items.map((assignment) => scheduleAssignmentReminders(assignment)));
          setNotificationMessage("Đã bật quyền thông báo trên thiết bị. Ứng dụng đã kiểm tra và lên lịch nhắc cho các deadline còn phù hợp.");
        } catch {
          setNotificationMessage("Quyền thông báo đã bật và lựa chọn đã lưu, nhưng chưa tải được danh sách deadline từ máy chủ để lên lịch nhắc hiện có.");
        }
        setScheduledReminderCount(await getScheduledAssignmentReminderCount(user?.id));
      } else {
        await AsyncStorage.setItem(storageKey, "false");
        setNotificationsEnabled(false);
        await cancelAssignmentRemindersForUser(user?.id ?? "anonymous");
        setScheduledReminderCount(await getScheduledAssignmentReminderCount(user?.id));
        setNotificationMessage("Đã tắt nhắc deadline và hủy các nhắc đang chờ trên thiết bị này.");
      }
    } catch {
      setNotificationMessage("Không thể cập nhật cài đặt thông báo. Vui lòng thử lại và kiểm tra quyền của thiết bị.");
    } finally {
      setNotificationBusy(false);
    }
  };

  const notificationSubtitle = Platform.OS === "web"
    ? "Không hỗ trợ thông báo deadline trên web"
    : notificationsEnabled && notificationPermissionGranted === false
      ? "Tùy chọn đã lưu nhưng hệ điều hành chưa cấp quyền"
      : notificationsEnabled && scheduledReminderCount > 0
        ? `Đã cấp quyền • ${scheduledReminderCount} lượt nhắc đang được lên lịch`
        : notificationsEnabled
          ? "Đã bật quyền • chưa có lượt nhắc phù hợp đang chờ"
          : notificationPermissionGranted
            ? "Quyền thiết bị đã cấp, nhưng nhắc deadline đang tắt"
            : "Đang tắt";

  const sendTestNotification = async () => {
    if (Platform.OS === "web" || testNotificationBusy) return;
    setTestNotificationBusy(true);
    setNotificationMessage("");
    try {
      const setup = await configureNotifications(true);
      setNotificationPermissionGranted(setup.granted);
      if (!setup.granted) {
        setNotificationMessage("Không thể gửi thử vì thiết bị chưa cấp quyền thông báo. Hãy bật quyền trong Cài đặt rồi thử lại.");
        return;
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Thông báo thử Study Planner",
          body: "Thông báo trên thiết bị đang hoạt động. Bạn có thể tiếp tục dùng nhắc deadline.",
          data: { testNotification: true },
          sound: "default",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
          channelId: "deadlines",
        },
      });
      setNotificationMessage("Đã lên lịch thông báo thử sau 5 giây. Hãy đưa ứng dụng xuống nền hoặc khóa màn hình để kiểm tra thông báo hệ thống.");
    } catch {
      setNotificationMessage("Không lên lịch được thông báo thử. Hãy kiểm tra quyền thông báo và chạy trên bản ứng dụng iOS/Android.");
    } finally {
      setTestNotificationBusy(false);
    }
  };

  const doLogout = async () => {
    setLoggingOut(true);
    let serverSessionClosed = false;
    try {
      serverSessionClosed = await logout();
    } finally {
      router.replace("/login");
      setLoggingOut(false);
    }
    if (!serverSessionClosed) {
      Alert.alert(
        "Đã đăng xuất trên thiết bị",
        "Không thể xác nhận máy chủ đã thu hồi phiên vì kết nối bị gián đoạn. Access token đã được xóa khỏi thiết bị; hãy kết nối mạng và đăng nhập lại để tiếp tục sử dụng.",
      );
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
            {(user?.name ?? "Bạn").slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.name ?? "Chưa đăng nhập"}
          </Text>
          <Text style={[styles.email, { color: colors.muted }]}>
            {user?.email ?? ""}
          </Text>
        </View>
        <Ionicons name={showDetails ? "chevron-down" : "chevron-forward"} size={18} color={colors.muted} />
      </Pressable>

      {showDetails && (
        <View style={[styles.detailsBox, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <Text style={[styles.detailText, { color: colors.text }]}>Tài khoản: {user?.email ?? "Chưa có thông tin"}</Text>
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
            <Text style={[styles.rowSub, { color: colors.muted }]}>{notificationSubtitle}</Text>
          </View>
          <Switch
            value={notificationsEnabled && notificationPermissionGranted === true}
            onValueChange={(value) => { void changeNotifications(value); }}
            disabled={Platform.OS === "web" || notificationBusy}
            trackColor={{ false: colors.line, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={[styles.notificationHelp, { borderBottomColor: colors.line }]}>
          <Text style={[styles.rowSub, { color: colors.muted }]}>Thông báo cục bộ: nhắc trước hạn 5 phút và cảnh báo thêm 5 phút sau hạn. Nếu đánh dấu bài hoàn thành hoặc sửa hạn trong ứng dụng, lịch nhắc sẽ được cập nhật/hủy. Cần bật quyền thông báo trên iOS/Android; thông báo do hệ điều hành gửi kể cả khi ứng dụng ở nền/đã đóng. Đây không phải push từ máy chủ.</Text>
          {notificationBusy ? <Text style={[styles.rowSub, { color: colors.primary, marginTop: 6 }]}>Đang cập nhật trạng thái thông báo…</Text> : null}
          <Pressable
            onPress={() => void sendTestNotification()}
            disabled={Platform.OS === "web" || testNotificationBusy}
            style={[styles.testNotificationButton, { borderColor: colors.line, opacity: Platform.OS === "web" || testNotificationBusy ? 0.5 : 1 }]}
          >
            <Ionicons name="paper-plane-outline" size={15} color={colors.primary} />
            <Text style={[styles.testNotificationText, { color: colors.primary }]}>{testNotificationBusy ? "Đang kiểm tra…" : "Gửi thông báo thử (sau 5 giây)"}</Text>
          </Pressable>
          {notificationMessage ? <Text style={[styles.notificationMessage, { color: notificationMessage.startsWith("Không") || notificationMessage.startsWith("Chưa") ? colors.warning : colors.muted }]}>{notificationMessage}</Text> : null}
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
  row: { minHeight: 64, paddingVertical: 10, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1 },
  notificationHelp: { paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1 },
  notificationMessage: { fontSize: 11, lineHeight: 16, marginTop: 7 },
  testNotificationButton: { alignSelf: "flex-start", minHeight: 38, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, marginTop: 10, flexDirection: "row", alignItems: "center", gap: 7 },
  testNotificationText: { fontSize: 11, fontWeight: "800" }, 
  rowTitle: { fontSize: 12, fontWeight: "700" }, 
  rowSub: { fontSize: 10, marginTop: 2 }, 
  flex: { flex: 1 }, 
  widget: { borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 14, flexDirection: "row", alignItems: "center", gap: 11 }, 
  logout: { height: 48, borderWidth: 1, borderRadius: 12, marginTop: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, 
  logoutText: { fontSize: 12, fontWeight: "800" }
});