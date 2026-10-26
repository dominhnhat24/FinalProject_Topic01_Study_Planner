import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
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
  const doLogout = async () => { setLoggingOut(true); await logout(); router.replace("/login"); };

  const rows = [
    { icon: "person-outline" as const, label: "Thông tin tài khoản" },
    { icon: "settings-outline" as const, label: "Cài đặt" },
    { icon: "notifications-outline" as const, label: "Thông báo" },
  ];

  return <ScrollView style={[styles.screen, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
    <Text style={[styles.title, { color: colors.text }]}>Cá nhân</Text>
    <View style={styles.profileHead}><View style={[styles.avatar, { backgroundColor: `${colors.primary}18` }]}><Text style={[styles.avatarText, { color: colors.primary }]}>{(user?.name ?? "U").slice(0, 2).toUpperCase()}</Text></View><Text style={[styles.name, { color: colors.text }]}>{user?.name ?? "Người dùng"}</Text><Text style={[styles.email, { color: colors.muted }]}>{user?.email ?? ""}</Text></View>
    {pending > 0 ? <View style={[styles.sync, { backgroundColor: `${colors.warning}15`, borderColor: `${colors.warning}50` }]}><Ionicons name="cloud-upload-outline" size={18} color={colors.warning} /><View style={styles.flex}><Text style={[styles.rowTitle, { color: colors.text }]}>Có {pending} thay đổi chờ đồng bộ</Text><Text style={[styles.rowSub, { color: colors.muted }]}>Ứng dụng sẽ gửi lại khi có mạng.</Text></View></View> : null}
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      {rows.map((row) => <Pressable key={row.label} style={styles.row}><Ionicons name={row.icon} size={20} color={colors.primary}/><Text style={[styles.rowTitle, { color: colors.text }]}>{row.label}</Text><Ionicons name="chevron-forward" size={17} color={colors.muted}/></Pressable>)}
      <View style={styles.row}><Ionicons name="color-palette-outline" size={20} color={colors.primary}/><View style={styles.flex}><Text style={[styles.rowTitle, { color: colors.text }]}>Giao diện</Text><Text style={[styles.rowSub, { color: colors.muted }]}>{mode === "dark" ? "Tối" : "Sáng"}</Text></View><Switch value={mode === "dark"} onValueChange={() => void toggle()} trackColor={{ false: colors.line, true: colors.primary }} thumbColor="#FFFFFF" /></View>
    </View>
    <Pressable onPress={() => router.push("/tabs/assignments")} style={[styles.widget, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}28` }]}><Ionicons name="grid-outline" size={20} color={colors.primary}/><View style={styles.flex}><Text style={[styles.rowTitle, { color: colors.text }]}>48 giờ tới</Text><Text style={[styles.rowSub, { color: colors.muted }]}>Xem bài tập sắp đến hạn.</Text></View><Ionicons name="chevron-forward" size={17} color={colors.primary}/></Pressable>
    <Pressable onPress={() => void doLogout()} disabled={loggingOut} style={[styles.logout, { borderColor: `${colors.error}50`, backgroundColor: `${colors.error}08` }]}><Ionicons name="log-out-outline" size={19} color={colors.error}/><Text style={[styles.logoutText, { color: colors.error }]}>{loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</Text></Pressable>
  </ScrollView>;
}
const styles=StyleSheet.create({screen:{flex:1},content:{padding:20,paddingBottom:35},title:{fontSize:25,fontWeight:"800"},profileHead:{alignItems:"center",paddingVertical:26},avatar:{width:78,height:78,borderRadius:39,alignItems:"center",justifyContent:"center"},avatarText:{fontSize:26,fontWeight:"800"},name:{fontSize:15,fontWeight:"800",marginTop:10},email:{fontSize:10,marginTop:4},sync:{borderWidth:1,borderRadius:14,padding:12,flexDirection:"row",alignItems:"center",gap:10,marginBottom:12},card:{borderWidth:1,borderRadius:17,overflow:"hidden"},row:{minHeight:58,paddingHorizontal:15,flexDirection:"row",alignItems:"center",gap:12,borderBottomWidth:1,borderBottomColor:"#E2E8F055"},rowTitle:{fontSize:11,fontWeight:"700"},rowSub:{fontSize:9,marginTop:3},flex:{flex:1},widget:{borderWidth:1,borderRadius:14,padding:14,marginTop:14,flexDirection:"row",alignItems:"center",gap:11},logout:{height:48,borderWidth:1,borderRadius:12,marginTop:18,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},logoutText:{fontSize:12,fontWeight:"800"}});
