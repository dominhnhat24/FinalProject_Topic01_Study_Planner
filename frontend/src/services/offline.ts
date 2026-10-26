import AsyncStorage from "@react-native-async-storage/async-storage";

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

export async function readQueue(): Promise<Mutation[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? (JSON.parse(raw) as Mutation[]) : [];
}

export async function writeQueue(items: Mutation[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export async function enqueueMutation(item: Omit<Mutation, "id" | "createdAt">): Promise<Mutation> {
  const next: Mutation = { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: Date.now() };
  const queue = await readQueue();
  queue.push(next);
  await writeQueue(queue);
  return next;
}

export async function updateCachedArray<T extends { id: string }>(key: string, updater: (items: T[]) => T[]): Promise<void> {
  const current = (await readCache<T[]>(key)) ?? [];
  await writeCache(key, updater(current));
}
