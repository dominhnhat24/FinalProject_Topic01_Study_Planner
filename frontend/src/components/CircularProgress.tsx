import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export function CircularProgress({ value, size = 92 }: { value: number; size?: number }) {
  const { colors } = useTheme();
  const clamped = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const stroke = Math.max(7, Math.round(size * 0.09));
  const half = size / 2;
  const deg = `${Math.round((clamped / 100) * 360)}deg`;
  return (
    <View style={[styles.wrapper, { width: size, height: size, borderRadius: half }]}>
      <View style={[styles.track, { width: size, height: size, borderRadius: half, borderWidth: stroke, borderColor: colors.line }]} />
      <View
        style={[
          styles.progress,
          {
            width: size,
            height: size,
            borderRadius: half,
            borderWidth: stroke,
            borderRightColor: clamped >= 25 ? colors.success : "transparent",
            borderTopColor: clamped >= 50 ? colors.success : "transparent",
            borderLeftColor: clamped >= 75 ? colors.success : "transparent",
            borderBottomColor: colors.success,
            transform: [{ rotate: `-${360 - Number(deg.replace("deg", ""))}deg` }],
          },
        ]}
      />
      <View style={styles.center}>
        <Text style={[styles.value, { color: colors.text }]}>{Math.round(clamped)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", justifyContent: "center" },
  track: { position: "absolute" },
  progress: { position: "absolute", borderTopColor: "transparent", borderLeftColor: "transparent" },
  center: { position: "absolute", alignItems: "center", justifyContent: "center" },
  value: { fontSize: 15, fontWeight: "800", includeFontPadding: false },
});
