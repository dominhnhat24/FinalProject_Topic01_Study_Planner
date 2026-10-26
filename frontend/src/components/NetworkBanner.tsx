import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNetworkStatus } from "../services/network";
import { useTheme } from "../context/ThemeContext";
import { useOfflineQueueCount } from "./useOfflineQueueCount";
import { syncOfflineMutations } from "../services/sync";

export function NetworkBanner() {
  const online = useNetworkStatus();
  const count = useOfflineQueueCount();
  const { colors } = useTheme();

  useEffect(() => {
    if (online && count > 0) void syncOfflineMutations();
  }, [online, count]);

  if (online && count === 0) return null;

  return (
    <View style={[styles.banner, { backgroundColor: online ? colors.warning : colors.error }]}>
      <Text style={styles.text}>
        {online ? `Đang đồng bộ ${count} thay đổi chưa gửi...` : "Bạn đang offline · hiển thị dữ liệu gần nhất"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { paddingVertical: 7, paddingHorizontal: 14, alignItems: "center" },
  text: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
});
