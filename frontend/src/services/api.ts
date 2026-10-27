import Constants from "expo-constants";
import { Platform } from "react-native";
import { session } from "./session";
import { enqueueMutation, readCache, writeCache } from "./offline";

function resolveBaseUrl(): string {
  const configuredUrl = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (!configuredUrl) return "";
  if (Platform.OS === "web" || !/localhost|127\.0\.0\.1/.test(configuredUrl)) return configuredUrl;
  const hostUri = Constants.expoConfig?.hostUri ?? "";
  const host = hostUri.split(":")[0];
  return host ? configuredUrl.replace(/localhost|127\.0\.0\.1/, host) : configuredUrl;
}

const BASE_URL = resolveBaseUrl();
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export class ApiRequestError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message = "Không thể kết nối máy chủ. Đang chuyển sang chế độ offline.") {
    super(message);
    this.name = "NetworkError";
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  // Internal override used by logout so a concurrent account switch cannot change
  // which token the revocation request sends.
  tokenOverride?: string | null;
  cacheKey?: string;
  skipCache?: boolean;
};

export type ApiResponse<T> = { success: boolean; data: T; message?: string };

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  if (!BASE_URL) throw new Error("Chưa cấu hình EXPO_PUBLIC_API_URL trong frontend/.env.");
  const method = options.method ?? "GET";
  const token = options.auth === false
    ? null
    : options.tokenOverride !== undefined
      ? options.tokenOverride
      : await session.getToken();

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });

    // Discard any response that belongs to a session which has since changed.
    // Prevents late responses from the previous account from reaching screen state.
    if (options.auth !== false && (await session.getToken()) !== token) {
      throw new ApiRequestError("Phiên đăng nhập đã thay đổi. Vui lòng tải lại dữ liệu.", 409);
    }

    const result = (await response.json().catch(() => null)) as
      | (ApiResponse<T> & { details?: unknown })
      | { message?: string }
      | null;

    if (!response.ok) {
      if (response.status === 401 && options.auth !== false && token) {
        // Do not let a delayed 401 from an old request log out a newer account/session.
        // The request may have been sent before the user switched accounts.
        const cleared = await session.clearTokenIfCurrent(token);
        if (cleared) unauthorizedHandler?.();
      }
      const message = (result && "message" in result && result.message) || `Yêu cầu thất bại (HTTP ${response.status})`;
      throw new ApiRequestError(message, response.status);
    }
    if (!result || !("data" in result)) throw new Error("API trả về dữ liệu không hợp lệ.");

    const cacheable = !path.startsWith("/auth/") && options.auth !== false;
    const scopedKey = `${await cacheScope(token)}:${options.cacheKey ?? path}`;
    if (method === "GET" && !options.skipCache && cacheable) {
      await writeCache(scopedKey, result.data);
    }
    // Re-check after response parsing and cache I/O, both of which may yield while
    // another login/logout changes the active account.
    if (options.auth !== false && (await session.getToken()) !== token) {
      throw new ApiRequestError("Phiên đăng nhập đã thay đổi. Vui lòng tải lại dữ liệu.", 409);
    }
    return result.data;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    if (options.auth !== false && (await session.getToken()) !== token) {
      throw new ApiRequestError("Phiên đăng nhập đã thay đổi. Vui lòng tải lại dữ liệu.", 409);
    }
    const cacheable = !path.startsWith("/auth/") && options.auth !== false;
    if (method === "GET" && !options.skipCache && cacheable) {
      const scopedKey = `${await cacheScope(token)}:${options.cacheKey ?? path}`;
      const cached = await readCache<T>(scopedKey);
      if (cached !== null) {
        if (options.auth !== false && (await session.getToken()) !== token) {
          throw new ApiRequestError("Phiên đăng nhập đã thay đổi. Vui lòng tải lại dữ liệu.", 409);
        }
        return cached;
      }
    }
    throw new NetworkError();
  }
}

export async function queueMutation(input: {
  method: "POST" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  resource?: "assignment" | "course";
  localId?: string;
}) {
  return enqueueMutation(input);
}

// Scope offline data to the authenticated session so account switches cannot reuse another user's cache.
async function cacheScope(token: string | null): Promise<string> {
  if (!token) return "anonymous";
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `user-${(hash >>> 0).toString(36)}`;
}

export async function scopedCacheKey(path: string): Promise<string> {
  return `${await cacheScope(await session.getToken())}:${path}`;
}
