import AsyncStorage from "@react-native-async-storage/async-storage";
import { session } from "./session";

export type Mutation = {
  id: string;
  method: "POST" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  resource?: "assignment" | "course";
  localId?: string;
  createdAt: number;
};

const CACHE_PREFIX = "study_planner.cache.";
const QUEUE_KEY = "study_planner.mutation_queue";

async function scopedQueueKey(ownerUserId?: string | null): Promise<string> {
  const userId = ownerUserId === undefined ? await session.getUserId() : ownerUserId;
  if (userId) return `${QUEUE_KEY}.user.${userId}`;
  // Legacy tokens without user metadata use an isolated fallback key; new mutations require a user ID.
  const token = await session.getToken();
  if (!token) return `${QUEUE_KEY}.anonymous`;
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) { hash ^= token.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  return `${QUEUE_KEY}.legacy.${(hash >>> 0).toString(36)}`;
}

export async function readCache<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function writeCache<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(value));
}

export async function clearCache(key: string): Promise<void> {
  await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
}

export async function readQueue(ownerUserId?: string | null): Promise<Mutation[]> {
  const raw = await AsyncStorage.getItem(await scopedQueueKey(ownerUserId));
  return raw ? (JSON.parse(raw) as Mutation[]) : [];
}

export async function writeQueue(items: Mutation[], ownerUserId?: string | null): Promise<void> {
  await AsyncStorage.setItem(await scopedQueueKey(ownerUserId), JSON.stringify(items));
}

export async function enqueueMutation(item: Omit<Mutation, "id" | "createdAt">): Promise<Mutation> {
  const ownerUserId = await session.getUserId();
  if (!ownerUserId) throw new Error("Không thể lưu thao tác offline khi chưa xác định được tài khoản hiện tại.");
  const next: Mutation = { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: Date.now() };
  const queue = await readQueue(ownerUserId);
  queue.push(next);
  await writeQueue(queue, ownerUserId);
  return next;
}

export async function updateCachedArray<T extends { id: string }>(key: string, updater: (items: T[]) => T[]): Promise<void> {
  const current = (await readCache<T[]>(key)) ?? [];
  await writeCache(key, updater(current));
}
