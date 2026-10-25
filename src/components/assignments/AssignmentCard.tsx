import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type AssignmentCardProps = {
  title: string;
  courseName: string;
  dueAt: string;
  status: 'pending' | 'completed';
  onToggleStatus?: () => void;
  onPress?: () => void;
};

export function AssignmentCard({
  title,
  courseName,
  dueAt,
  status,
  onToggleStatus,
  onPress,
}: AssignmentCardProps) {
  // Các đoạn code bên dưới giữ nguyên...
  const isCompleted = status === 'completed';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.courseName}>{courseName}</Text>
          <TouchableOpacity 
            style={[styles.badge, isCompleted ? styles.badgeCompleted : styles.badgePending]}
            onPress={onToggleStatus}
          >
            <Text style={[styles.badgeText, isCompleted ? styles.textCompleted : styles.textPending]}>
              {isCompleted ? 'Hoàn thành' : 'Đang làm'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, isCompleted && styles.titleCompleted]}>
          {title}
        </Text>

        <Text style={styles.dueAt}>
          📅 Hạn nộp: {new Date(dueAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  courseName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgeCompleted: {
    backgroundColor: '#D1FAE5',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  textPending: {
    color: '#D97706',
  },
  textCompleted: {
    color: '#059669',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  dueAt: {
    fontSize: 12,
    color: '#6B7280',
  },
});