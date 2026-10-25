
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const courses = [
  { code: "MOB401", name: "Lập trình di động", done: 4, total: 6, color: "#4F46E5" },
  { code: "SWE301", name: "Công nghệ phần mềm", done: 3, total: 5, color: "#27966B" },
  { code: "DBI302", name: "Cơ sở dữ liệu", done: 5, total: 5, color: "#E89535" },
  { code: "SAD301", name: "Phân tích thiết kế hệ thống", done: 2, total: 4, color: "#D45B87" },
  { code: "WEB302", name: "Phát triển ứng dụng web", done: 3, total: 5, color: "#1597A5" },
  { code: "ENG401", name: "Tiếng Anh chuyên ngành", done: 0, total: 3, color: "#7C65C1" },
];

export default function CoursesScreen() {
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={s.eyebrow}>CHƯƠNG TRÌNH HỌC</Text>
      <Text style={s.title}>Học phần</Text>
      <Text style={s.subtitle}>Theo dõi tiến độ của từng môn học.</Text>

      <View style={s.overview}>
        <View style={s.overviewItem}>
          <Text style={s.overviewValue}>{courses.length}</Text>
          <Text style={s.overviewLabel}>Học phần</Text>
        </View>
        <View style={s.divider} />
        <View style={s.overviewItem}>
          <Text style={s.overviewValue}>
            {courses.reduce((sum, course) => sum + course.done, 0)}
          </Text>
          <Text style={s.overviewLabel}>Bài đã xong</Text>
        </View>
        <View style={s.divider} />
        <View style={s.overviewItem}>
          <Text style={s.overviewValue}>
            {courses.reduce((sum, course) => sum + course.total - course.done, 0)}
          </Text>
          <Text style={s.overviewLabel}>Còn lại</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Danh sách môn học</Text>

      {courses.map((course) => {
        const percentage = Math.round((course.done / course.total) * 100);

        return (
          <View key={course.code} style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.courseIcon, { backgroundColor: `${course.color}18` }]}>
                <Ionicons name="book-outline" size={23} color={course.color} />
              </View>

              <View style={s.info}>
                <Text style={s.courseName}>{course.name}</Text>
                <Text style={s.code}>{course.code}</Text>
              </View>

              <Text style={[s.percentage, { color: course.color }]}>
                {percentage}%
              </Text>
            </View>

            <View style={s.track}>
              <View
                style={[
                  s.fill,
                  { width: `${percentage}%`, backgroundColor: course.color },
                ]}
              />
            </View>

            <View style={s.cardFooter}>
              <Text style={s.meta}>
                {course.done}/{course.total} bài tập hoàn thành
              </Text>
              <Text style={s.meta}>
                {course.total - course.done} còn lại
              </Text>
            </View>
          </View>
        );
      })}

      <Text style={s.note}>
        Tiến độ đang được tính từ dữ liệu mẫu. Khi kết nối backend, số liệu sẽ
        được tính từ các bài tập thuộc từng học phần.
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
  overview: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#ECEEF4", paddingVertical: 18, marginTop: 23, marginBottom: 27 },
  overviewItem: { flex: 1, alignItems: "center", gap: 6 },
  overviewValue: { color: "#20243A", fontSize: 22, fontWeight: "800" },
  overviewLabel: { color: "#858BA0", fontSize: 10 },
  divider: { width: 1, backgroundColor: "#ECEEF4" },
  sectionTitle: { color: "#20243A", fontSize: 17, fontWeight: "800", marginBottom: 14 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#ECEEF4" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  courseIcon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  info: { flex: 1, gap: 5 },
  courseName: { color: "#20243A", fontSize: 12, fontWeight: "700" },
  code: { color: "#858BA0", fontSize: 10 },
  percentage: { fontSize: 15, fontWeight: "800" },
  track: { height: 6, backgroundColor: "#F0F1F6", borderRadius: 4, marginTop: 18, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, gap: 8 },
  meta: { color: "#858BA0", fontSize: 10 },
  note: { color: "#858BA0", fontSize: 11, lineHeight: 18, marginTop: 12 },
});
