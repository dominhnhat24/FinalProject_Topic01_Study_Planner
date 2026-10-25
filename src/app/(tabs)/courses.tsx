import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput, Modal } from 'react-native';
import { CourseCard } from '../../components/courses/CourseCard';

// Dữ liệu mẫu (Mock data) cho danh sách học phần - Sửa lại tên biến ở đây
const INITIAL_COURSES = [
  {
    id: '1',
    code: 'MOB101',
    name: 'Lập trình Mobile',
    color: '#4F46E5',
  },
  {
    id: '2',
    code: 'DBN202',
    name: 'Cơ sở dữ liệu nâng cao',
    color: '#059669',
  },
  {
    id: '3',
    code: 'NET301',
    name: 'Quản trị mạng CCNA',
    color: '#D97706',
  },
];

export default function CoursesScreen() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [modalVisible, setModalVisible] = useState(false);

  // State cho form thêm học phần mới
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4F46E5');

  // Hàm thêm học phần
  const handleAddCourse = () => {
    if (!code.trim() || !name.trim()) return;

    const newCourse = {
      id: Date.now().toString(),
      code: code.toUpperCase(),
      name,
      color,
    };

    setCourses([newCourse, ...courses]);
    setCode('');
    setName('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tiêu đề trang */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Học phần của tôi</Text>
          <Text style={styles.headerSubtitle}>Quản lý các môn học trong kỳ</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách học phần */}
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CourseCard
            code={item.code}
            name={item.name}
            color={item.color}
          />
        )} // <--- Nhớ có đủ dấu ) và } ở đây nhé!
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal thêm học phần */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm Học Phần Mới</Text>

            <Text style={styles.label}>Mã học phần</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: WEB101"
              placeholderTextColor="#9CA3AF"
              value={code}
              onChangeText={setCode}
            />

            <Text style={styles.label}>Tên học phần</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Lập trình Web"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleAddCourse}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});