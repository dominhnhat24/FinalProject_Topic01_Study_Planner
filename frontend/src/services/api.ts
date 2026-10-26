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
  cacheKey?: string;
  skipCache?: boolean;
};

export type ApiResponse<T> = { success: boolean; data: T; message?: string };

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  if (!BASE_URL) throw new Error("Chưa cấu hình EXPO_PUBLIC_API_URL trong frontend/.env.");
  const method = options.method ?? "GET";
  const token = options.auth === false ? null : await session.getToken();

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

    const result = (await response.json().catch(() => null)) as
      | (ApiResponse<T> & { details?: unknown })
      | { message?: string }
      | null;

    if (!response.ok) {
      const message = (result && "message" in result && result.message) || `Yêu cầu thất bại (HTTP ${response.status})`;
      throw new ApiRequestError(message, response.status);
    }
    if (!result || !("data" in result)) throw new Error("API trả về dữ liệu không hợp lệ.");

    if (method === "GET" && !options.skipCache) {
      await writeCache(options.cacheKey ?? path, result.data);
    }
    return result.data;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    if (method === "GET") {
      const cached = await readCache<T>(options.cacheKey ?? path);
      if (cached !== null) return cached;
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
