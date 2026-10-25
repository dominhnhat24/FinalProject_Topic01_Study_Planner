
import { session } from "./session";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  console.warn("Missing EXPO_PUBLIC_API_URL in frontend/.env");
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new Error("Chưa cấu hình địa chỉ API.");
  }

  const token = options.auth === false
    ? null
    : await session.getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    },
    ...(options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {}),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      result?.message ??
      result?.error?.message ??
      `Yêu cầu thất bại (HTTP ${response.status})`;

    throw new Error(message);
  }

  return result as T;
}
