import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Kiểm tra xem người dùng có đang ở trong nhóm trang "tabs" hay không
    const inAuthGroup = segments[0] === "tabs";

    if (!user && inAuthGroup) {
      // Nếu CHƯA đăng nhập mà cố vào tabs -> Đẩy ngược về trang Login
      router.replace("/login");
    } else if (user && !inAuthGroup) {
      // Nếu ĐÃ đăng nhập mà đang ở trang login/register -> Đẩy thẳng vào tabs (Trang chủ)
      router.replace("/tabs");
    }
  }, [user, loading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}