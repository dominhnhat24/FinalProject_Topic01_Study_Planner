import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { AssignmentCard } from '../../components/assignments/AssignmentCard';
import { useAuthStore } from '../../stores/authStore'; // Lấy store đăng nhập

export default function DashboardScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);

  // Lấy dữ liệu tên và MSSV thực tế từ tài khoản đăng nhập (hoặc fallback nếu chưa có)
  const displayName = currentUser?.fullName || currentUser?.username || 'Trịnh Quang Duy';
  const displayId = currentUser?.username || '1923051143';

  // Dữ liệu thống kê mẫu trên Dashboard
  const stats = {
    total: 12,
    completed: 8,
    pending: 4,
    progressPercent: 67,
  };

  const upcomingAssignments = [
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
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Phần Chào hỏi & Thông tin cá nhân lấy từ tài khoản đăng nhập */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.greetingText}>Xin chào, 👋</Text>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.studentId}>MSSV: {displayId}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Thẻ Thống kê tiến độ học tập */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Tiến độ học tập kỳ này</Text>
            <Text style={styles.progressPercentText}>{stats.progressPercent}%</Text>
          </View>
          
          {/* Thanh progress bar giả lập */}
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${stats.progressPercent}%` }]} />
          </View>

          <View style={styles.statsFooter}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Tổng số</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#059669' }]}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#D97706' }]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Đang làm</Text>
            </View>
          </View>
        </View>

        {/* Danh sách bài tập sắp đến hạn */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bài tập sắp đến hạn 📌</Text>
        </View>

        {upcomingAssignments.map((item) => (
          <AssignmentCard
            key={item.id}
            title={item.title}
            courseName={item.courseName}
            dueAt={item.dueAt}
            status={item.status}
          />
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 24,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  studentId: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
    marginTop: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
});