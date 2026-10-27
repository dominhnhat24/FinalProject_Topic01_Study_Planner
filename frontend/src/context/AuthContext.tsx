import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import type { PropsWithChildren } from "react";
import type { User } from "../types/api";
import { apiRequest } from "../services/api";

type LoginInput = { email: string; password: string };
type RegisterInput = LoginInput & { name: string };
type AuthContextValue = { 
  user: User | null; 
  loading: boolean; 
  isAuthenticated: boolean; 
  login: (input: LoginInput) => Promise<void>; 
  register: (input: RegisterInput) => Promise<void>; 
  logout: () => Promise<void>; 
  refreshUser: () => Promise<void> 
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  // 1. Mặc định BAN ĐẦU chưa đăng nhập (user = null, authenticated = false)
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hàm tải thông tin user hiện tại từ Backend khi bật App
  const refreshUser = useCallback(async () => {
    try {
      const userData = await apiRequest<User>("/auth/me");
      setUser(userData);
      setAuthenticated(true);
    } catch {
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  // Hàm Đăng nhập kết nối MongoDB
  const login = useCallback(async (input: LoginInput) => {
    try {
      const response = await apiRequest<{ user: User; token?: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setUser(response.user);
      setAuthenticated(true);
    } catch (err) {
      // Nếu chưa bật server backend hoặc lỗi API, bạn có thể quăng lỗi để form login hiển thị thông báo
      throw err;
    }
  }, []);

  // Hàm Đăng ký kết nối MongoDB
  const register = useCallback(async (input: RegisterInput) => {
    try {
      const response = await apiRequest<{ user: User; token?: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setUser(response.user);
      setAuthenticated(true);
    } catch (err) {
      throw err;
    }
  }, []);

  // Hàm Đăng xuất
  const logout = useCallback(async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // Bỏ qua lỗi mạng nếu có
    } finally {
      setUser(null);
      setAuthenticated(false);
    }
  }, []);

  const value = useMemo(() => ({ 
    user, 
    loading, 
    isAuthenticated: authenticated, 
    login, 
    register, 
    logout, 
    refreshUser 
  }), [user, loading, authenticated, login, register, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { 
  const value = useContext(AuthContext); 
  if (!value) throw new Error("useAuth must be used inside AuthProvider"); 
  return value; 
}