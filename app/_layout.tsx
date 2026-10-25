import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" options={{ title: 'Đăng Nhập', headerShown: true }} />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}