
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const tasks = [
  { id: "1", title: "Hoàn thành bài tập lập trình", course: "Lập trình di động", due: "Hôm nay, 23:59", status: "Chưa xong" },
  { id: "2", title: "Ôn tập chương 3", course: "Phân tích thiết kế hệ thống", due: "Ngày mai, 20:00", status: "Chưa xong" },
  { id: "3", title: "Nộp báo cáo nhóm", course: "Công nghệ phần mềm", due: "27/10, 17:00", status: "Chưa xong" },
  { id: "4", title: "Bài thực hành cơ sở dữ liệu", course: "Cơ sở dữ liệu", due: "Đã nộp", status: "Hoàn thành" },
];

type Filter = "Tất cả" | "Chưa xong" | "Hoàn thành";

export default function AssignmentsScreen() {
  const [filter, setFilter] = useState<Filter>("Tất cả");

  const filteredTasks = tasks.filter(
    (task) => filter === "Tất cả" || task.status === filter,
  );

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={s.eyebrow}>QUẢN LÝ HỌC TẬP</Text>
      <Text style={s.title}>Bài tập của tôi</Text>
      <Text style={s.subtitle}>Theo dõi và quản lý tất cả deadline.</Text>

      <View style={s.summary}>
        <Text style={s.summaryLabel}>Tổng số bài tập</Text>
        <Text style={s.summaryValue}>25 bài</Text>
        <Text style={s.summaryHint}>17 đã hoàn thành · 8 đang thực hiện</Text>
      </View>

      <View style={s.filters}>
        {(["Tất cả", "Chưa xong", "Hoàn thành"] as Filter[]).map((item) => {
          const active = item === filter;

          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(item)}
              style={[s.filter, active && s.activeFilter]}
            >
              <Text style={[s.filterText, active && s.activeFilterText]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={s.listHeader}>
        <Text style={s.sectionTitle}>Danh sách bài tập</Text>
        <Text style={s.count}>{filteredTasks.length} mục</Text>
      </View>

      {filteredTasks.map((task) => {
        const completed = task.status === "Hoàn thành";

        return (
          <View key={task.id} style={s.card}>
            <View style={[s.iconBox, completed && s.doneBox]}>
              <Ionicons
                name={completed ? "checkmark-circle" : "document-text-outline"}
                size={23}
                color={completed ? "#27966B" : "#4F46E5"}
              />
            </View>

            <View style={s.info}>
              <Text style={s.taskTitle}>{task.title}</Text>
              <Text style={s.course}>{task.course}</Text>
              <Text style={[s.due, completed && s.doneText]}>{task.due}</Text>
            </View>

            <Ionicons
              name={completed ? "checkmark-circle" : "chevron-forward"}
              size={19}
              color={completed ? "#27966B" : "#A0A4B5"}
            />
          </View>
        );
      })}

      {filteredTasks.length === 0 && (
        <View style={s.empty}>
          <Ionicons name="file-tray-outline" size={34} color="#858BA0" />
          <Text style={s.emptyTitle}>Không có bài tập</Text>
          <Text style={s.course}>Thử chọn bộ lọc khác.</Text>
        </View>
      )}

      <Text style={s.disclaimer}>
        Dữ liệu hiện là mẫu. Thao tác cập nhật bài tập sẽ được kết nối API sau.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F8FC" },
  content: { padding: 20, paddingBottom: 30 },
  eyebrow: { color: "#4F46E5", fontSize: 11, fontWeight: "800", letterSpacing: 1.3 },
  title: { color: "#20243A", fontSize: 25, fontWeight: "800", marginTop: 8 },
  subtitle: { color: "#858BA0", fontSize: 12, marginTop: 6 },
  summary: { backgroundColor: "#4F46E5", borderRadius: 17, padding: 20, marginTop: 23 },
  summaryLabel: { color: "#E4E2FF", fontSize: 12 },
  summaryValue: { color: "#FFFFFF", fontSize: 29, fontWeight: "800", marginTop: 6 },
  summaryHint: { color: "#E4E2FF", fontSize: 11, marginTop: 5 },
  filters: { flexDirection: "row", gap: 8, marginTop: 22, marginBottom: 22 },
  filter: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#ECEEF4" },
  activeFilter: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
  filterText: { color: "#858BA0", fontSize: 11, fontWeight: "600" },
  activeFilterText: { color: "#FFFFFF" },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { color: "#20243A", fontSize: 16, fontWeight: "800" },
  count: { color: "#858BA0", fontSize: 11 },
  card: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#ECEEF4", borderRadius: 14, padding: 13, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  iconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#EEEDFF", alignItems: "center", justifyContent: "center" },
  doneBox: { backgroundColor: "#E5F7EF" },
  info: { flex: 1, gap: 5 },
  taskTitle: { color: "#20243A", fontSize: 12, fontWeight: "700" },
  course: { color: "#858BA0", fontSize: 11 },
  due: { color: "#E89535", fontSize: 10, fontWeight: "700" },
  doneText: { color: "#27966B" },
  empty: { alignItems: "center", padding: 30, gap: 10 },
  emptyTitle: { color: "#20243A", fontWeight: "700" },
  disclaimer: { color: "#858BA0", fontSize: 10, lineHeight: 16, marginTop: 18 },
});
