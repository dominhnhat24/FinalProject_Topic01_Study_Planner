import { createContext, useCallback, useContext, useMemo, useState, useEffect, useRef } from "react";
import type { PropsWithChildren } from "react";
import type { User } from "../types/api";
import { apiRequest, ApiRequestError, NetworkError, setUnauthorizedHandler } from "../services/api";
import { session } from "../services/session";
import { cancelAssignmentRemindersForUser } from "../services/notifications";
import type { AuthResponse } from "../types/api";
import { router } from "expo-router";

type LoginInput = { email: string; password: string; remember?: boolean };
type RegisterInput = LoginInput & { name: string };
type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const authOperation = useRef(0);

  const refreshUser = useCallback(async () => {
    const operation = ++authOperation.current;
    setLoading(true);
    try {
      const token = await session.getToken();
      if (operation !== authOperation.current) return;
      if (!token) {
        setUser(null);
        setAuthenticated(false);
        return;
      }

      try {
        const userData = await apiRequest<User>("/auth/me", { skipCache: true });
        const currentToken = await session.getToken();
        if (operation !== authOperation.current || currentToken !== token) return;
        await session.saveUserSnapshot(userData, token);
        if (operation !== authOperation.current || (await session.getToken()) !== token) return;
        setUser(userData);
        setAuthenticated(true);
      } catch (error) {
        const currentToken = await session.getToken();
        if (operation !== authOperation.current || currentToken !== token) return;

        if (error instanceof ApiRequestError && (error.status === 401 || error.status === 404)) {
          await session.clearToken();
          setUser(null);
          setAuthenticated(false);
          router.replace("/login");
          return;
        }

        if (error instanceof NetworkError) {
          const snapshot = await session.getUserSnapshot();
          if (operation !== authOperation.current || (await session.getToken()) !== token) return;
          if (snapshot) {
            setUser(snapshot);
            setAuthenticated(true);
            return;
          }
        }
        setUser(null);
        setAuthenticated(false);
      }
    } finally {
      if (operation === authOperation.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      authOperation.current += 1;
      setUser(null);
      setAuthenticated(false);
      setLoading(false);
      // Tự động chuyển hướng về trang login ngay khi gặp lỗi 401 / Unauthorized
      try {
        router.replace("/login");
      } catch {
        // Bỏ qua lỗi điều hướng nếu router chưa sẵn sàng
      }
    });
    void refreshUser();
    return () => setUnauthorizedHandler(null);
  }, [refreshUser]);

  const login = useCallback(async (input: LoginInput) => {
    const operation = ++authOperation.current;
    setLoading(true);
    setUser(null);
    setAuthenticated(false);
    try {
      await session.clearToken();
      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        auth: false,
        body: { email: input.email.trim().toLowerCase(), password: input.password },
        skipCache: true,
      });
      if (operation !== authOperation.current) return;
      await session.saveToken(response.accessToken, response.user, input.remember ?? true);
      if (operation !== authOperation.current) return;
      setUser(response.user);
      setAuthenticated(true);
    } catch (error) {
      if (operation === authOperation.current) {
        await session.clearToken();
        setUser(null);
        setAuthenticated(false);
      }
      throw error;
    } finally {
      if (operation === authOperation.current) setLoading(false);
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const operation = ++authOperation.current;
    setLoading(true);
    setUser(null);
    setAuthenticated(false);
    try {
      await session.clearToken();
      const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        auth: false,
        body: { name: input.name.trim(), email: input.email.trim().toLowerCase(), password: input.password },
        skipCache: true,
      });
      if (operation !== authOperation.current) return;
      await session.saveToken(response.accessToken, response.user, input.remember ?? true);
      if (operation !== authOperation.current) return;
      setUser(response.user);
      setAuthenticated(true);
    } catch (error) {
      if (operation === authOperation.current) {
        await session.clearToken();
        setUser(null);
        setAuthenticated(false);
      }
      throw error;
    } finally {
      if (operation === authOperation.current) setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<boolean> => {
    const operation = ++authOperation.current;
    const currentUser = user;
    let currentToken: string | null = null;
    let serverSessionClosed = false;
    setLoading(true);
    try {
      currentToken = await session.getToken();
      await apiRequest("/auth/logout", { method: "POST", tokenOverride: currentToken, skipCache: true }).catch(() => {});
      serverSessionClosed = currentToken !== null;
    } catch {
      serverSessionClosed = false;
    } finally {
      try {
        if (currentToken) await session.clearTokenIfCurrent(currentToken);
      } finally {
        if (currentUser) await cancelAssignmentRemindersForUser(currentUser.id).catch(() => {});
        if (operation === authOperation.current) {
          setUser(null);
          setAuthenticated(false);
          setLoading(false);
        }
        try {
          router.replace("/login");
        } catch {
          // Bỏ qua lỗi router
        }
      }
    }
    return serverSessionClosed;
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: authenticated,
    login,
    register,
    logout,
    refreshUser,
  }), [user, loading, authenticated, login, register, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}