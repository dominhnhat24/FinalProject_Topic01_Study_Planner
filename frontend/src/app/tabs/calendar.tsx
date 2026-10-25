
import { ScrollView, StyleSheet, Text, View } from "react-native";

const days = [
  { day: "T2", date: "26", active: false },
  { day: "T3", date: "27", active: true },
  { day: "T4", date: "28", active: false },
  { day: "T5", date: "29", active: false },
  { day: "T6", date: "30", active: false },
  { day: "T7", date: "31", active: false },
  { day: "CN", date: "01", active: false },
];

const events = [
  {
    time: "09:00",
    title: "Ôn tập chương 3",
    course: "Phân tích thiết kế hệ thống",
    color: "#4F46E5",
  },
  {
    time: "14:00",
    title: "Làm bài tập React Native",
    course: "Lập trình di động",
    color: "#E89535",
  },
  {
    time: "20:00",
    title: "Hoàn thiện báo cáo nhóm",
    course: "Công nghệ phần mềm",
    color: "#27966B",
  },
];

export default function CalendarScreen() {
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={s.eyebrow}>STUDY PLANNER</Text>
      <Text style={s.title}>Lịch học tập</Text>
      <Text style={s.subtitle}>Theo dõi các deadline trong tuần.</Text>

      <View style={s.weekHeader}>
        <Text style={s.month}>Tháng 10, 2026</Text>
        <Text style={s.weekLabel}>Tuần này</Text>
      </View>

      <View style={s.week}>
        {days.map((item) => (
          <View key={item.day} style={s.dayColumn}>
            <Text style={s.dayName}>{item.day}</Text>
            <View style={[s.dateCircle, item.active && s.activeCircle]}>
              <Text style={[s.dateText, item.active && s.activeDate]}>
                {item.date}
              </Text>
            </View>
            <View
              style={[
                s.dot,
                { backgroundColor: item.date === "27" ? "#4F46E5" : "transparent" },
              ]}
            />
          </View>
        ))}
      </View>

      <Text style={s.sectionTitle}>Lịch trình trong ngày</Text>
      <Text style={s.subtitle}>Thứ Ba, ngày 27 tháng 10</Text>

      {events.map((event) => (
        <View key={event.title} style={s.eventRow}>
          <Text style={s.time}>{event.time}</Text>
          <View style={[s.eventCard, { borderLeftColor: event.color }]}>
            <Text style={s.eventTitle}>{event.title}</Text>
            <Text style={s.course}>{event.course}</Text>
          </View>
        </View>
      ))}

      <View style={s.note}>
        <Text style={s.noteTitle}>Mẹo học tập</Text>
        <Text style={s.course}>
          Ưu tiên các bài tập có deadline gần nhất để tránh trễ hạn.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F8FC" },
  content: { padding: 20, paddingBottom: 30 },
  eyebrow: { color: "#4F46E5", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#20243A", fontSize: 25, fontWeight: "800", marginTop: 8 },
  subtitle: { color: "#858BA0", fontSize: 12, marginTop: 6 },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 27,
    marginBottom: 18,
  },
  month: { fontSize: 15, color: "#20243A", fontWeight: "800" },
  weekLabel: { color: "#4F46E5", fontSize: 12, fontWeight: "700" },
  week: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ECEEF4",
  },
  dayColumn: { alignItems: "center", gap: 9 },
  dayName: { fontSize: 10, color: "#858BA0" },
  dateCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircle: { backgroundColor: "#4F46E5" },
  dateText: { fontSize: 12, color: "#20243A", fontWeight: "600" },
  activeDate: { color: "#FFFFFF" },
  dot: { width: 5, height: 5, borderRadius: 3 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#20243A",
    marginTop: 28,
    marginBottom: 5,
  },
  eventRow: { flexDirection: "row", gap: 12, marginTop: 17 },
  time: { width: 45, paddingTop: 12, fontSize: 11, color: "#858BA0" },
  eventCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "#ECEEF4",
    borderRightColor: "#ECEEF4",
    borderBottomColor: "#ECEEF4",
  },
  eventTitle: { color: "#20243A", fontSize: 13, fontWeight: "700" },
  course: { color: "#858BA0", fontSize: 11, marginTop: 7, lineHeight: 17 },
  note: {
    backgroundColor: "#EEEDFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 25,
  },
  noteTitle: { color: "#4F46E5", fontWeight: "800", marginBottom: 6 },
});
