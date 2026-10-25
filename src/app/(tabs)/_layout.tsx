import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#4F46E5' }}>
      <Tabs.Screen name="index" options={{ title: 'Trang chủ' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Lịch' }} />
      <Tabs.Screen name="assignments" options={{ title: 'Bài tập' }} />
      <Tabs.Screen name="courses" options={{ title: 'Học phần' }} />
    </Tabs>
  );
}