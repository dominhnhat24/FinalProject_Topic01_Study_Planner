
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const C = {
  bg: "#F7F8FC",
  card: "#FFFFFF",
  text: "#20243A",
  muted: "#858BA0",
  primary: "#4F46E5",
  purpleLight: "#EEEDFF",
  orange: "#E89535",
  orangeLight: "#FFF3E2",
  green: "#27966B",
  greenLight: "#E5F7EF",
  line: "#ECEEF4",
};

const tasks = [
  {
    title: "Hoàn thành bài tập lập trình",
    course: "Lập trình di động",
    due: "Hôm nay · 23:59",
    color: C.orange,
    icon: "code-slash-outline" as const,
  },
  {
    title: "Ôn tập chương 3",
    course: "Phân tích thiết kế hệ thống",
    due: "Ngày mai · 20:00",
    color: C.primary,
    icon: "document-text-outline" as const,
  },
  {
    title: "Nộp báo cáo nhóm",
    course: "Công nghệ phần mềm",
    due: "27/10 · 17:00",
    color: C.green,
    icon: "people-outline" as const,
  },
];

function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>STUDY PLANNER</Text>
          <Text style={styles.heading}>Xin chào, sinh viên 👋</Text>
          <Text style={styles.subtitle}>Cùng hoàn thành mục tiêu hôm nay.</Text>
        </View>

        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={23} color={C.primary} />
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressLabel}>TIẾN ĐỘ HỌC TẬP</Text>
            <Text style={styles.progressNumber}>68%</Text>
            <Text style={styles.progressHint}>
              Bạn đang đi đúng kế hoạch!
            </Text>
          </View>
          <View style={styles.progressIcon}>
            <Ionicons name="trophy-outline" size={30} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.progressFoot}>17 / 25 bài tập đã hoàn thành</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: C.orangeLight }]}>
            <Ionicons name="time-outline" size={20} color={C.orange} />
          </View>
          <Text style={styles.statValue}>03</Text>
          <Text style={styles.statLabel}>Sắp đến hạn</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: C.greenLight }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color={C.green} />
          </View>
          <Text style={styles.statValue}>17</Text>
          <Text style={styles.statLabel}>Đã hoàn thành</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: C.purpleLight }]}>
            <Ionicons name="book-outline" size={20} color={C.primary} />
          </View>
          <Text style={styles.statValue}>06</Text>
          <Text style={styles.statLabel}>Học phần</Text>
        </View>
      </View>

      <SectionTitle title="Deadline sắp tới" action="Xem tất cả →" />

      {tasks.map((task, index) => (
        <View key={task.title} style={styles.taskCard}>
          <View style={[styles.taskAccent, { backgroundColor: task.color }]} />

          <View style={[styles.taskIcon, { backgroundColor: `${task.color}15` }]}>
            <Ionicons name={task.icon} size={22} color={task.color} />
          </View>

          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskCourse}>{task.course}</Text>
            <View style={styles.dueRow}>
              <Ionicons name="alarm-outline" size={14} color={task.color} />
              <Text style={[styles.dueText, { color: task.color }]}>
                {task.due}
              </Text>
            </View>
          </View>
        </View>
      ))}

      <SectionTitle title="Kế hoạch hôm nay" />

      <View style={styles.planCard}>
        <View style={styles.planIcon}>
          <Ionicons name="calendar-clear-outline" size={22} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskTitle}>Tập trung hoàn thành 2 nhiệm vụ</Text>
          <Text style={styles.taskCourse}>
            Ưu tiên bài tập có deadline gần nhất.
          </Text>
        </View>
      </View>

      <Text style={styles.footer}>Study Planner · Học tập có kế hoạch</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingTop: 18, paddingBottom: 28 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  greeting: {
    color: C.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  heading: { fontSize: 22, fontWeight: "800", color: C.text },
  subtitle: { fontSize: 12, color: C.muted, marginTop: 6 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCard: {
    backgroundColor: C.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  progressTop: { flexDirection: "row", alignItems: "center" },
  progressLabel: {
    color: "#DCD9FF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  progressNumber: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 5,
  },
  progressHint: { color: "#E4E2FF", fontSize: 12, marginTop: 3 },
  progressIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FFFFFF25",
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FFFFFF40",
    overflow: "hidden",
    marginTop: 20,
  },
  progressFill: {
    width: "68%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  progressFoot: { color: "#E4E2FF", fontSize: 11, marginTop: 9 },
  stats: { flexDirection: "row", gap: 10, marginBottom: 27 },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: { color: C.text, fontSize: 23, fontWeight: "800" },
  statLabel: { color: C.muted, fontSize: 10, marginTop: 4 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
    marginTop: 2,
  },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: C.text },
  action: { color: C.primary, fontSize: 12, fontWeight: "700" },
  taskCard: {
    backgroundColor: C.card,
    borderRadius: 15,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.line,
    overflow: "hidden",
  },
  taskAccent: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
  },
  taskIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  taskInfo: { flex: 1, gap: 5 },
  taskTitle: { color: C.text, fontSize: 12, fontWeight: "700" },
  taskCourse: { color: C.muted, fontSize: 11 },
  dueRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dueText: { fontSize: 10, fontWeight: "700" },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: C.line,
  },
  planIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    textAlign: "center",
    color: C.muted,
    fontSize: 10,
    marginTop: 26,
  },
});
