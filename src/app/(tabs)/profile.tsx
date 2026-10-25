import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);
  const currentUser = useAuthStore((state) => state.currentUser); // Lấy thông tin tài khoản đang đăng nhập từ Store

  // Lấy dữ liệu thực tế từ tài khoản đăng ký/đăng nhập, nếu chưa có thì hiển thị fallback
  // Lấy dữ liệu thực tế từ tài khoản đăng ký/đăng nhập, tự động tạo email theo username
  const studentInfo = {
    name: currentUser?.fullName || currentUser?.username || 'Người dùng Study Planner',
    studentId: currentUser?.username || '1923051143',
    email: `${currentUser?.username || 'duy'}@student.vn`,
    major: 'Kỹ thuật Phần mềm (Software Engineering)',
  };

  const doLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.log('Lỗi signOut:', err);
    } finally {
      router.replace('/auth/login');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất không?');
      if (confirmed) {
        doLogout();
      }
    } else {
      Alert.alert(
        'Đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Đăng xuất', 
            style: 'destructive',
            onPress: doLogout,
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tiêu đề trang */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trang cá nhân</Text>
        <Text style={styles.headerSubtitle}>Thông tin tài khoản sinh viên</Text>
      </View>

      {/* Thẻ thông tin cá nhân hiển thị động */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {/* Lấy chữ cái đầu tiên của tên làm avatar */}
          <Text style={styles.avatarText}>
            {studentInfo.name ? studentInfo.name.charAt(0).toUpperCase() : 'D'}
          </Text>
        </View>

        <Text style={styles.name}>{studentInfo.name}</Text>
        <Text style={styles.studentId}>MSSV / Tài khoản: {studentInfo.studentId}</Text>
        
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{studentInfo.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chuyên ngành:</Text>
            <Text style={styles.infoValue}>{studentInfo.major}</Text>
          </View>
        </View>
      </View>

      {/* Nút Đăng xuất */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginTop: 12,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 20,
  },
  infoBox: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: 'bold',
  },
});