import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { AssignmentCard } from '../../components/assignments/AssignmentCard';

// Dữ liệu mẫu (Mock data) để test giao diện trước khi Minh đẩy API thật sang
const INITIAL_ASSIGNMENTS = [
  {
    id: '1',
    title: 'Hoàn thành màn hình lịch tuần',
    courseName: 'Lập trình Mobile',
    dueAt: '2026-10-28T09:00:00.000Z',
    status: 'pending' as const,
  },
  {
    id: '2',
    title: 'Cấu hình Database Mongoose',
    courseName: 'Cơ sở dữ liệu nâng cao',
    dueAt: '2026-10-30T23:59:00.000Z',
    status: 'pending' as const,
  },
  {
    id: '3',
    title: 'Thiết kế giao diện trang cá nhân',
    courseName: 'Lập trình Mobile',
    dueAt: '2026-10-25T12:00:00.000Z',
    status: 'completed' as const,
  },
];

export default function AssignmentsScreen() {
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [filter, setFilter] = useState<'ALL' | 'pending' | 'completed'>('ALL');

  // Hàm xử lý đổi trạng thái bài tập khi bấm vào badge
  const handleToggleStatus = (id: string) => {
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'pending' ? 'completed' : 'pending' }
          : item
      )
    );
  };

  // Lọc danh sách bài tập theo trạng thái
  const filteredAssignments = assignments.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Tiêu đề trang */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách Bài tập</Text>
        <Text style={styles.headerSubtitle}>Quản lý tiến độ học tập của bạn</Text>
      </View>

      {/* Thanh bộ lọc (Filter Tabs) */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'ALL' && styles.filterActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>Tất cả</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>Đang làm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>Hoàn thành</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách bài tập hiển thị bằng FlatList và AssignmentCard */}
      <FlatList
        data={filteredAssignments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AssignmentCard
            title={item.title}
            courseName={item.courseName}
            dueAt={item.dueAt}
            status={item.status}
            onToggleStatus={() => handleToggleStatus(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  filterActive: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});