import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

type Props = {
  visible: boolean;
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
  title?: string;
};

const MONTHS = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function CalendarDatePickerModal({ visible, selectedDate, onSelect, onClose, title = "Chọn ngày" }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [displayMonth, setDisplayMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const [monthYearMode, setMonthYearMode] = useState(false);
  const [chosenMonth, setChosenMonth] = useState(selectedDate.getMonth());
  const [yearText, setYearText] = useState(String(selectedDate.getFullYear()));
  const [yearError, setYearError] = useState("");

  useEffect(() => {
    if (!visible) return;
    setDisplayMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    setChosenMonth(selectedDate.getMonth());
    setYearText(String(selectedDate.getFullYear()));
    setMonthYearMode(false);
    setYearError("");
  }, [visible, selectedDate]);

  const cells = useMemo(() => {
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1), ...Array(Math.max(0, 42 - offset - days)).fill(null)];
  }, [displayMonth]);

  const moveMonth = (amount: number) => {
    setDisplayMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const applyMonthYear = () => {
    const year = Number(yearText);
    if (!/^\d{4}$/.test(yearText) || year < 1900 || year > 2200) {
      setYearError("Vui lòng nhập năm từ 1900 đến 2200.");
      return;
    }
    setDisplayMonth(new Date(year, chosenMonth, 1));
    setYearError("");
    setMonthYearMode(false);
  };

  const chooseDay = (day: number) => {
    const next = new Date(
      displayMonth.getFullYear(), displayMonth.getMonth(), day,
      selectedDate.getHours(), selectedDate.getMinutes(), selectedDate.getSeconds(), selectedDate.getMilliseconds(),
    );
    onSelect(next);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.overlay, { paddingTop: Math.max(insets.top, 18), paddingBottom: Math.max(insets.bottom, 18) }]}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Pressable onPress={onClose} accessibilityLabel="Đóng bộ chọn ngày" hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.muted} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => { setChosenMonth(displayMonth.getMonth()); setYearText(String(displayMonth.getFullYear())); setMonthYearMode((current) => !current); }}
            style={[styles.monthHeader, { backgroundColor: colors.bg, borderColor: colors.line }]}
            accessibilityRole="button"
            accessibilityLabel="Chọn tháng và năm"
          >
            <Text style={[styles.monthTitle, { color: colors.text }]}>{MONTHS[displayMonth.getMonth()]} {displayMonth.getFullYear()}</Text>
            <Ionicons name={monthYearMode ? "chevron-up" : "chevron-down"} size={18} color={colors.primary} />
          </Pressable>

          {monthYearMode ? (
            <View style={styles.monthYearPanel}>
              <Text style={[styles.label, { color: colors.text }]}>Năm</Text>
              <TextInput
                value={yearText}
                onChangeText={(value) => { setYearText(value.replace(/\D/g, "").slice(0, 4)); setYearError(""); }}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="2026"
                placeholderTextColor={colors.muted}
                style={[styles.yearInput, { color: colors.text, borderColor: colors.line, backgroundColor: colors.bg }]}
                accessibilityLabel="Năm"
              />
              <Text style={[styles.label, { color: colors.text }]}>Tháng</Text>
              <View style={styles.monthGrid}>
                {MONTHS.map((month, index) => (
                  <Pressable key={month} onPress={() => setChosenMonth(index)} style={[styles.monthOption, { borderColor: chosenMonth === index ? colors.primary : colors.line, backgroundColor: chosenMonth === index ? colors.softBlue : colors.bg }]}>
                    <Text style={[styles.monthOptionText, { color: chosenMonth === index ? colors.primary : colors.text }]}>{month}</Text>
                  </Pressable>
                ))}
              </View>
              {yearError ? <Text style={[styles.error, { color: colors.error }]}>{yearError}</Text> : null}
              <Pressable onPress={applyMonthYear} style={[styles.confirmButton, { backgroundColor: colors.primary }]}><Text style={styles.confirmText}>Áp dụng</Text></Pressable>
            </View>
          ) : (
            <>
              <View style={styles.monthNavigation}>
                <Pressable onPress={() => moveMonth(-1)} style={styles.navButton} accessibilityLabel="Tháng trước"><Ionicons name="chevron-back" size={20} color={colors.primary} /></Pressable>
                <Text style={[styles.monthHint, { color: colors.muted }]}>Chọn ngày trong tháng</Text>
                <Pressable onPress={() => moveMonth(1)} style={styles.navButton} accessibilityLabel="Tháng sau"><Ionicons name="chevron-forward" size={20} color={colors.primary} /></Pressable>
              </View>
              <View style={styles.grid}>
                {WEEKDAYS.map((day) => <View key={day} style={styles.cell}><Text style={[styles.weekday, { color: colors.muted }]}>{day}</Text></View>)}
                {cells.map((day, index) => {
                  if (!day) return <View key={`blank-${index}`} style={styles.cell} />;
                  const isSelected = day === selectedDate.getDate() && displayMonth.getMonth() === selectedDate.getMonth() && displayMonth.getFullYear() === selectedDate.getFullYear();
                  const today = day === new Date().getDate() && displayMonth.getMonth() === new Date().getMonth() && displayMonth.getFullYear() === new Date().getFullYear();
                  return (
                    <Pressable key={`day-${day}`} onPress={() => chooseDay(day)} style={[styles.cell, styles.dayCell, isSelected && { backgroundColor: colors.primary }, today && !isSelected && { borderColor: colors.primary, borderWidth: 1 }]} accessibilityRole="button" accessibilityLabel={`${day} ${MONTHS[displayMonth.getMonth()]} ${displayMonth.getFullYear()}`}>
                      <Text style={[styles.dayText, { color: isSelected ? "#FFFFFF" : colors.text }, today && !isSelected && { fontWeight: "900" }]}>{day}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.footer}>
                <Pressable onPress={() => { const now = new Date(); const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), selectedDate.getHours(), selectedDate.getMinutes(), selectedDate.getSeconds(), selectedDate.getMilliseconds()); setDisplayMonth(new Date(now.getFullYear(), now.getMonth(), 1)); onSelect(next); onClose(); }} style={[styles.todayButton, { borderColor: colors.line }]}><Text style={[styles.todayText, { color: colors.primary }]}>Hôm nay</Text></Pressable>
                <Pressable onPress={onClose} style={[styles.confirmButton, { backgroundColor: colors.primary, flex: 1 }]}><Text style={styles.confirmText}>Đóng</Text></Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.5)", alignItems: "center", justifyContent: "center", padding: 18 },
  sheet: { width: "100%", maxWidth: 420, borderWidth: 1, borderRadius: 22, padding: 16, maxHeight: "92%" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  title: { fontSize: 19, fontWeight: "800" },
  monthHeader: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  monthTitle: { fontSize: 15, fontWeight: "800" },
  monthNavigation: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 6 },
  navButton: { width: 40, height: 38, alignItems: "center", justifyContent: "center" },
  monthHint: { fontSize: 11, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start" },
  cell: { width: `${100 / 7}%`, height: 42, alignItems: "center", justifyContent: "center" },
  weekday: { fontSize: 11, fontWeight: "800" },
  dayCell: { borderRadius: 21 },
  dayText: { fontSize: 13, fontWeight: "600" },
  footer: { flexDirection: "row", gap: 10, marginTop: 12 },
  todayButton: { minWidth: 92, minHeight: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  todayText: { fontWeight: "800", fontSize: 12 },
  confirmButton: { minHeight: 44, paddingHorizontal: 16, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 10 },
  confirmText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  monthYearPanel: { paddingTop: 8 },
  label: { fontSize: 12, fontWeight: "800", marginTop: 8, marginBottom: 6 },
  yearInput: { height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 15 },
  monthGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  monthOption: { width: "31%", minHeight: 40, borderWidth: 1, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  monthOptionText: { fontSize: 11, fontWeight: "700" },
  error: { fontSize: 12, marginTop: 8 },
});
