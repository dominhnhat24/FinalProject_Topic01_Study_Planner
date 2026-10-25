import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007aff' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang Chủ',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}