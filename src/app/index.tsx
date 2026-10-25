import { Redirect } from 'expo-router';

export default function Index() {
  // Chuyển hướng chuẩn vào auth/login
  return <Redirect href="/auth/login" />;
}