import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { CircularProgress } from "../../components/CircularProgress";
import { EmptyState } from "../../components/EmptyState";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import type { Assignment, Course, CourseProgress } from "../../types/api";
import { dueLabel } from "../../utils/date";



export default function HomeScreen() {
  const { colors } = useTheme(); const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]); const [courses, setCourses] = useState<Course[]>([]); const [progress, setProgress] = useState<CourseProgress[]>([]); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    try {
      const [a, c, p] = await Promise.all([apiRequest<{ items: Assignment[] }>("/assignments?limit=100&page=1"), apiRequest<Course[]>("/courses"), apiRequest<CourseProgress[]>("/assignments/progress")]);
      setAssignments(a.items); setCourses(c); setProgress(p);
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể tải dữ liệu."); throw err; }
  }, []);
  useEffect(() => { void load().finally(() => setLoading(false)); }, [load]);
  const total = progress.reduce((sum, item) => sum + item.total, 0); const completed = progress.reduce((sum, item) => sum + item.completed, 0); const rate = total ? Math.round((completed / total) * 100) : 0;
  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const upcoming = useMemo(() => assignments.filter((item) => item.status === "pending").sort((a,b) => +new Date(a.dueAt)-+new Date(b.dueAt)).slice(0,4), [assignments]);
  const widget48h = useMemo(() => assignments.filter((item) => item.status === "pending" && +new Date(item.dueAt) > Date.now() && +new Date(item.dueAt) <= Date.now()+48*60*60*1000).sort((a,b) => +new Date(a.dueAt)-+new Date(b.dueAt)), [assignments]);

  if (loading) return <View style={[styles.center, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color={colors.primary} /><Text style={[styles.muted, { color: colors.muted }]}>Đang tải trang chủ...</Text></View>;
  return <ScrollView style={[styles.screen, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load().finally(() => setRefreshing(false)); }} tintColor={colors.primary} />}>
    <View style={styles.topRow}><View><Text style={[styles.title, { color: colors.text }]}>Trang chủ</Text><Text style={[styles.greeting, { color: colors.text }]}>Xin chào, {user?.name || "bạn"} 👋</Text><Text style={[styles.muted, { color: colors.muted }]}>Hãy tiếp tục hành trình học tập của bạn!</Text></View><Pressable onPress={() => router.push("/tabs/profile")} style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.line }]}><Ionicons name="notifications-outline" size={21} color={colors.text} /><View style={[styles.badge, { backgroundColor: colors.error }]} /></Pressable></View>
    {error ? <Text style={[styles.error, { color: colors.error, backgroundColor: `${colors.error}12` }]}>{error}</Text> : null}
    <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.line }]}><CircularProgress value={rate} size={88}/><View style={styles.progressInfo}><Text style={[styles.smallLabel, { color: colors.muted }]}>Tiến độ chung</Text><Text style={[styles.big, { color: colors.text }]}>{completed}/{total} bài</Text><Text style={[styles.muted, { color: colors.muted }]}>đã hoàn thành</Text></View></View>
    <View style={styles.sectionRow}><Text style={[styles.sectionTitle, { color: colors.text }]}>Bài tập sắp đến hạn</Text><Pressable onPress={() => router.push("/tabs/assignments")} style={[styles.seeAll, { backgroundColor: colors.softBlue }]}><Text style={[styles.link, { color: colors.primary }]}>Xem tất cả</Text></Pressable></View>
    {upcoming.length ? upcoming.map((task) => { const course=courseMap.get(task.courseId); const color=colors.primary; return <Pressable key={task.id} onPress={() => router.push(`/assignments/${task.id}`)} style={[styles.task, { backgroundColor: colors.surface, borderColor: colors.line }]}><View style={[styles.emojiBox, { backgroundColor: colors.softBlue }]}><Text style={styles.emoji}>📘</Text></View><View style={styles.taskInfo}><Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>{task.title}</Text><Text style={[styles.taskMeta, { color: colors.muted }]}>{course?.code ?? ""} · {dueLabel(task.dueAt, user?.timezone ?? "Asia/Ho_Chi_Minh")}</Text></View><Ionicons name="chevron-forward" size={16} color={colors.muted} /></Pressable>; }) : <EmptyState title="Chưa có deadline" message="Database chưa có bài tập sắp đến hạn." />}
    <View style={styles.sectionRow}><Text style={[styles.sectionTitle, { color: colors.text }]}>Học phần của tôi</Text><Pressable onPress={() => router.push("/tabs/courses")}><Text style={[styles.link, { color: colors.primary }]}>Xem tất cả</Text></Pressable></View>
    {courses.slice(0,4).map((course) => { const item=progress.find((p)=>p.courseId===course.id); return <Pressable key={course.id} onPress={() => router.push("/tabs/courses")} style={[styles.course, { backgroundColor: colors.surface, borderColor: colors.line }]}><View style={[styles.courseIcon, { backgroundColor: colors.softBlue }]}><Text style={styles.courseEmoji}>📒</Text></View><View style={styles.taskInfo}><Text style={[styles.taskTitle, { color: colors.text }]}>{course.name}</Text><Text style={[styles.taskMeta, { color: colors.muted }]}>{course.code} · {item?.completed ?? 0}/{item?.total ?? 0} bài</Text></View><Ionicons name="chevron-forward" size={16} color={colors.muted} /></Pressable>; })}
    {courses.length === 0 ? (
  <EmptyState
    title="Chưa có học phần"
    message="Tạo học phần đầu tiên từ tab Học phần."
    icon="library-outline"
  />
) : null}
    <Pressable onPress={() => router.push("/tabs/assignments")} style={[styles.widget, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}><View style={[styles.widgetIcon, { backgroundColor: colors.primary }]}><Ionicons name="time-outline" size={18} color="#FFF" /></View><View style={styles.taskInfo}><Text style={[styles.widgetTitle, { color: colors.text }]}>Sắp đến hạn trong 48 giờ</Text><Text style={[styles.taskMeta, { color: colors.muted }]}>{widget48h.length} bài tập cần chú ý</Text></View><Ionicons name="chevron-forward" size={16} color={colors.primary} /></Pressable>
  </ScrollView>;
}
const styles=StyleSheet.create({screen:{flex:1},content:{padding:20,paddingTop:18,paddingBottom:28},center:{flex:1,alignItems:"center",justifyContent:"center",gap:10},muted:{fontSize:11,lineHeight:17},topRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",gap:12},title:{fontSize:24,fontWeight:"800"},greeting:{fontSize:14,fontWeight:"700",marginTop:6},iconButton:{width:42,height:42,borderRadius:13,borderWidth:1,alignItems:"center",justifyContent:"center"},badge:{position:"absolute",right:8,top:7,width:6,height:6,borderRadius:3},error:{padding:10,borderRadius:10,fontSize:10,marginTop:14},progressCard:{borderRadius:18,borderWidth:1,padding:18,flexDirection:"row",alignItems:"center",gap:18,marginTop:20},progressInfo:{flex:1},smallLabel:{fontSize:10,fontWeight:"700"},big:{fontSize:21,fontWeight:"800",marginTop:4},sectionRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:24,marginBottom:11},sectionTitle:{fontSize:15,fontWeight:"800"},seeAll:{paddingHorizontal:9,paddingVertical:6,borderRadius:999},link:{fontSize:10,fontWeight:"800"},task:{borderWidth:1,borderRadius:14,padding:13,flexDirection:"row",alignItems:"center",gap:11,marginBottom:9},emojiBox:{width:34,height:34,borderRadius:11,alignItems:"center",justifyContent:"center"},emoji:{fontSize:17},dot:{width:11,height:11,borderRadius:6},taskInfo:{flex:1},taskTitle:{fontSize:12,fontWeight:"700"},taskMeta:{fontSize:10,marginTop:4},course:{borderWidth:1,borderRadius:14,padding:13,flexDirection:"row",alignItems:"center",gap:11,marginBottom:9},courseIcon:{width:40,height:40,borderRadius:12,alignItems:"center",justifyContent:"center"},courseEmoji:{fontSize:19},widget:{borderWidth:1,borderRadius:14,padding:13,flexDirection:"row",alignItems:"center",gap:11,marginTop:12},widgetIcon:{width:34,height:34,borderRadius:10,alignItems:"center",justifyContent:"center"},widgetTitle:{fontSize:11,fontWeight:"800"}});
