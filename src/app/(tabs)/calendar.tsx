import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { AssignmentCard } from '../../components/assignments/AssignmentCard';

// Giả lập danh sách ngày trong tuần hiện tại
const DAYS_OF_WEEK = [
  { day: 'T2', date: '26', fullDate: '2026-10-26' },
  { day: 'T3', date: '27', fullDate: '2026-10-27' },
  { day: 'T4', date: '28', fullDate: '2026-10-28' },
  { day: 'T5', date: '29', fullDate: '2026-10-29' },
  { day: 'T6', date: '30', fullDate: '2026-10-30' },
  { day: 'T7', date: '31', fullDate: '2026-10-31' },
  { day: 'CN', date: '01', fullDate: '2026-11-01' },
];

// Dữ liệu mẫu bài tập gắn theo ngày nộp
const CALENDAR_ASSIGNMENTS = [
  {
    id: '1',
    title: 'Hoàn thành màn hình lịch tuần',
    courseName: 'Lập trình Mobile',
    dueAt: '2026-10-28T09:00:00.000Z',
    status: 'pending' as const,
  },
  {
    id: '2',
    title: 'Nộp báo cáo Tiến độ Đồ án',
    courseName: 'Quản trị dự án',
    dueAt: '2026-10-28T17:00:00.000Z',
    status: 'pending' as const,
  },
  {
    id: '3',
    title: 'Cấu hình Database Mongoose',
    courseName: 'Cơ sở dữ liệu nâng cao',
    dueAt: '2026-10-30T23:59:00.000Z',
    status: 'pending' as const,
  },
];

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('2026-10-28');

  // Lọc danh sách bài tập theo ngày được chọn
  const filteredAssignments = CALENDAR_ASSIGNMENTS.filter((item) =>
    item.dueAt.startsWith(selectedDate)
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tiêu đề trang */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch Học & Bài Tập</Text>
        <Text style={styles.headerSubtitle}>Tháng 10, 2026</Text>
      </View>

      {/* Thanh chọn ngày trong tuần */}
      <View style={styles.weekContainer}>
        {DAYS_OF_WEEK.map((item) => {
          const isSelected = item.fullDate === selectedDate;
          return (
            <TouchableOpacity
              key={item.fullDate}
              style={[styles.dayCard, isSelected && styles.dayCardSelected]}
              onPress={() => setSelectedDate(item.fullDate)}
            >
              <Text style={[styles.dayText, isSelected && styles.textSelected]}>{item.day}</Text>
              <Text style={[styles.dateText, isSelected && styles.textSelected]}>{item.date}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Danh sách công việc/bài tập trong ngày được chọn */}
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>
          Bài tập ngày {selectedDate.split('-').reverse().join('/')}
        </Text>

        {filteredAssignments.length > 0 ? (
          <FlatList
            data={filteredAssignments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AssignmentCard
                title={item.title}
                courseName={item.courseName}
                dueAt={item.dueAt}
                status={item.status}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🎉 Không có bài tập nào đến hạn vào ngày này!</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  dayCard: {
    width: 44,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayCardSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  dayText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  textSelected: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});