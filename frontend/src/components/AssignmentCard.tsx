// frontend/src/components/AssignmentCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AssignmentCardProps {
  title: string;
  courseName: string;
  courseColor?: string;
  dueDate: string;
  priority?: string;
  isCompleted: boolean;
  onToggle: () => void;
  onPress: () => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  title,
  courseName,
  courseColor = '#6C5CE7',
  dueDate,
  priority = 'MEDIUM',
  isCompleted,
  onToggle,
  onPress,
}) => {
  // Hàm lấy màu sắc an toàn tuyệt đối, tránh lỗi undefined 'bg'
  const getBadgeStyle = () => {
    const p = (priority || '').toUpperCase();
    if (p === 'HIGH') {
      return { label: 'Gấp', bg: '#FFE5E5', color: '#D63031' };
    } else if (p === 'LOW') {
      return { label: 'Thong thả', bg: '#E3FCF7', color: '#00B894' };
    }
    return { label: 'Trung bình', bg: '#FFF4E5', color: '#E17055' };
  };

  const badge = getBadgeStyle();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, isCompleted && styles.completedContainer]}
    >
      <View style={[styles.colorBar, { backgroundColor: courseColor || '#6C5CE7' }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.courseText} numberOfLines={1}>
            {courseName || 'Môn học'}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.priorityText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.title, isCompleted && styles.completedText]}
          numberOfLines={2}
        >
          {title || 'Chưa có tiêu đề'}
        </Text>

        <View style={styles.footer}>
          <View style={styles.deadlineContainer}>
            <Ionicons name="time-outline" size={15} color="#636E72" />
            <Text style={styles.dueDateText}>{dueDate || 'Không có hạn'}</Text>
          </View>

          <TouchableOpacity onPress={onToggle} style={styles.checkboxTouch}>
            <Ionicons
              name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
              size={26}
              color={isCompleted ? '#00B894' : '#B2BEC3'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  completedContainer: {
    opacity: 0.65,
    backgroundColor: '#F1F2F6',
  },
  colorBar: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#636E72',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#B2BEC3',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: 13,
    color: '#636E72',
  },
  checkboxTouch: {
    padding: 2,
  },
});