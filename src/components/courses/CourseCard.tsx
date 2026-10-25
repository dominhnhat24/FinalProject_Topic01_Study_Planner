import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type CourseCardProps = {
  code: string;
  name: string;
  color: string;
};

export function CourseCard({ code, name, color }: CourseCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e9ecef', alignItems: 'center' },
  colorBar: { width: 6, height: '100%', borderRadius: 3 },
  code: { fontSize: 12, fontWeight: 'bold', color: '#007aff' },
  name: { fontSize: 15, fontWeight: '600', color: '#212529', marginTop: 2 },
});