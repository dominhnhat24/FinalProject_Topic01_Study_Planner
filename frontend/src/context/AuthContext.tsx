import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { apiRequest, NetworkError } from "../services/api";
import { session } from "../services/session";
import { clearCache, readCache, writeCache } from "../services/offline";
import type { AuthResponse, User } from "../types/api";

type LoginInput = { email: string; password: string };
type RegisterInput = LoginInput & { name: string };
type AuthContextValue = { user: User | null; loading: boolean; isAuthenticated: boolean; login: (input: LoginInput) => Promise<void>; register: (input: RegisterInput) => Promise<void>; logout: () => Promise<void>; refreshUser: () => Promise<void> };

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_CACHE_KEY = "auth-user";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = await session.getToken();
    if (!token) { setUser(null); setAuthenticated(false); return; }
    setAuthenticated(true);
    try {
      const currentUser = await apiRequest<User>("/auth/me");
      await writeCache(USER_CACHE_KEY, currentUser);
      setUser(currentUser);
    } catch (error) {
      if (error instanceof NetworkError) {
        const cached = await readCache<User>(USER_CACHE_KEY);
        if (cached) { setUser(cached); setAuthenticated(true); return; }
        // Keep the token even when no user snapshot is available: the session is intentionally persistent.
        return;
      }
      await session.clearToken();
      setUser(null);
      setAuthenticated(false);
    }
  }, []);

  useEffect(() => { void refreshUser().finally(() => setLoading(false)); }, [refreshUser]);

  const login = useCallback(async (input: LoginInput) => {
    const result = await apiRequest<AuthResponse>("/auth/login", { method: "POST", body: input, auth: false });
    await session.saveToken(result.accessToken);
    await writeCache(USER_CACHE_KEY, result.user);
    setUser(result.user);
    setAuthenticated(true);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await apiRequest<AuthResponse>("/auth/register", { method: "POST", body: { ...input, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh" }, auth: false });
    await session.saveToken(result.accessToken);
    await writeCache(USER_CACHE_KEY, result.user);
    setUser(result.user);
    setAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try { await apiRequest("/auth/logout", { method: "POST" }); } catch { /* Stateless logout: local token is cleared below. */ }
    finally { await session.clearToken(); await clearCache(USER_CACHE_KEY); setUser(null); setAuthenticated(false); }
  }, []);

  const value = useMemo(() => ({ user, loading, isAuthenticated: authenticated, login, register, logout, refreshUser }), [user, loading, authenticated, login, register, logout, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used inside AuthProvider"); return value; }
