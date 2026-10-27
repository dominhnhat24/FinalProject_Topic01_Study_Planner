import { createContext, useCallback, useContext, useMemo, useState, useEffect, useRef } from "react";
import type { PropsWithChildren } from "react";
import type { User } from "../types/api";
import { apiRequest, ApiRequestError, NetworkError, setUnauthorizedHandler } from "../services/api";
import { session } from "../services/session";
import { cancelAssignmentRemindersForUser } from "../services/notifications";
import type { AuthResponse } from "../types/api";

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
  // Invalidates stale async auth operations when logout/account switching occurs.
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
        // Refresh the local profile snapshot only after the server validates the session.
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
          return;
        }

        // Permit offline app shell/cache use for the same local session, but never
        // switch identity based on an old request or a snapshot from another token.
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
      await apiRequest("/auth/logout", { method: "POST", tokenOverride: currentToken, skipCache: true });
      serverSessionClosed = currentToken !== null;
    } catch (error) {
      // A 401 means the server already refuses this token. Network/5xx failures
      // mean remote revocation could not be confirmed, though local logout proceeds.
      serverSessionClosed = currentToken !== null && error instanceof ApiRequestError && error.status === 401;
    } finally {
      try {
        // Only clear the session this logout started with. A concurrent login may
        // already have installed another token while the network request was pending.
        if (currentToken) await session.clearTokenIfCurrent(currentToken);
      } finally {
        if (currentUser) await cancelAssignmentRemindersForUser(currentUser.id);
        if (operation === authOperation.current) {
          setUser(null);
          setAuthenticated(false);
          setLoading(false);
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
