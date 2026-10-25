import { Redirect } from 'expo-router';

export default function Index() {
  // Chuyển hướng tự động sang màn hình đăng nhập hoặc tabs chính
  return <Redirect href="/login" />;
}