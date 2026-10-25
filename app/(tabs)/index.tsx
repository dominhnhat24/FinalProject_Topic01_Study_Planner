import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useAuthStore } from '../../Store/authStore';
import { usePlannerStore } from '../../Store/plannerStore';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const signOut = useAuthStore((state) => state.signOut);
  const router = useRouter();

  const { assignments, loadAssignments, addAssignment, toggleStatus, deleteAssignment } =
    usePlannerStore();

  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [courseName, setCourseName] = useState('');
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');

  useEffect(() => {
    if (currentUser?.username) {
      loadAssignments(currentUser.username);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const handleCreateAssignment = async () => {
    if (!courseName.trim() || !title.trim() || !dueAt.trim()) {
      if (Platform.OS === 'web') alert('Vui lòng điền đầy đủ thông tin bài tập!');
      else Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin bài tập!');
      return;
    }

    if (currentUser?.username) {
      await addAssignment({
        courseName: courseName.trim(),
        title: title.trim(),
        dueAt: dueAt.trim(),
        username: currentUser.username,
      });

      setCourseName('');
      setTitle('');
      setDueAt('');
      setModalVisible(false);
    }
  };

  const filteredData = assignments.filter((item) => {
    if (selectedStatus === 'ALL') return true;
    return item.status === selectedStatus;
  });

  const pendingCount = assignments.filter((a) => a.status === 'PENDING').length;
  const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.welcomeText}>Xin chào,</Text>
          <Text style={styles.userName}>{currentUser?.fullName || currentUser?.username || 'Sinh viên'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Thống kê tiến độ */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{assignments.length}</Text>
          <Text style={styles.statLabel}>Tổng số bài</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: '#ff9500' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Chưa xong</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: '#34c759' }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>Đã xong</Text>
        </View>
      </View>

      {/* Thanh lọc & Nút Thêm Bài Tập */}
      <View style={styles.actionRow}>
        <View style={styles.filterRow}>
          <TouchableOpacity onPress={() => setSelectedStatus('ALL')}>
            <Text style={selectedStatus === 'ALL' ? styles.filterActive : styles.filterText}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedStatus('PENDING')}>
            <Text style={selectedStatus === 'PENDING' ? styles.filterActive : styles.filterText}>Chưa xong</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedStatus('COMPLETED')}>
            <Text style={selectedStatus === 'COMPLETED' ? styles.filterActive : styles.filterText}>Đã xong</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Thêm bài tập</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách Bài tập */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có bài tập nào. Hãy thêm bài tập mới!</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.course}>{item.courseName}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.due}>Hạn nộp: {item.dueAt}</Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[
                  styles.statusBadge,
                  item.status === 'COMPLETED' ? styles.badgeCompleted : styles.badgePending,
                ]}
                onPress={() => currentUser && toggleStatus(item.id, currentUser.username)}
              >
                <Text style={styles.badgeText}>
                  {item.status === 'COMPLETED' ? '✓ Đã xong' : '⏳ Chưa xong'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => currentUser && deleteAssignment(item.id, currentUser.username)}
              >
                <Text style={styles.deleteText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal Thêm Bài Tập */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm Bài Tập Mới</Text>

            <TextInput
              style={styles.input}
              placeholder="Tên môn học (Ví dụ: Lập trình Mobile)"
              value={courseName}
              onChangeText={setCourseName}
            />

            <TextInput
              style={styles.input}
              placeholder="Tên bài tập / Nội dung"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Hạn nộp (Ví dụ: 2026-10-30)"
              value={dueAt}
              onChangeText={setDueAt}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.mBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.mBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mBtn, styles.saveBtn]} onPress={handleCreateAssignment}>
                <Text style={[styles.mBtnText, { color: '#fff' }]}>Lưu bài tập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  welcomeText: { fontSize: 13, color: '#6c757d' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#212529' },
  logoutBtn: { backgroundColor: '#dc3545', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: 'center', borderWidth: 1, borderColor: '#e9ecef' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#007aff' },
  statLabel: { fontSize: 11, color: '#6c757d', marginTop: 2 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  filterRow: { flexDirection: 'row', backgroundColor: '#e9ecef', padding: 4, borderRadius: 6 },
  filterText: { paddingHorizontal: 10, paddingVertical: 4, color: '#495057', fontSize: 12 },
  filterActive: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#fff', color: '#007aff', fontWeight: 'bold', borderRadius: 4 },
  addBtn: { backgroundColor: '#007aff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e9ecef', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  course: { fontSize: 12, color: '#007aff', fontWeight: 'bold' },
  title: { fontSize: 15, fontWeight: 'bold', marginVertical: 3, color: '#212529' },
  due: { fontSize: 12, color: '#6c757d' },
  cardActions: { alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 6 },
  badgePending: { backgroundColor: '#fff3cd' },
  badgeCompleted: { backgroundColor: '#d4edda' },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  deleteBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  deleteText: { color: '#dc3545', fontSize: 11, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#6c757d', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 14, color: '#007aff', textAlign: 'center' },
  input: { height: 44, borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, paddingHorizontal: 12, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  mBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, marginLeft: 8 },
  cancelBtn: { backgroundColor: '#e9ecef' },
  saveBtn: { backgroundColor: '#007aff' },
  mBtnText: { fontWeight: 'bold', fontSize: 13 },
});