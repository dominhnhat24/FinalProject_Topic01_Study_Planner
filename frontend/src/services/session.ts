import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { User } from "../types/api";

const TOKEN_KEY = "study_planner_access_token";
const USER_ID_KEY = "study_planner_session_user_id";
const USER_SNAPSHOT_KEY = "study_planner_session_user_snapshot";

let volatileToken: string | null = null;
let volatileUserId: string | null = null;
let volatileUserSnapshot: User | null = null;
let volatileSessionOnly = false;

// Serialize credential writes. Login/logout/profile refresh may overlap while network
// requests are in flight; ordered writes keep an old async operation from deleting or
// overwriting the newer account's session.
let mutationQueue: Promise<unknown> = Promise.resolve();
function serializeMutation<T>(operation: () => Promise<T>): Promise<T> {
  const next = mutationQueue.then(operation, operation);
  mutationQueue = next.then(() => undefined, () => undefined);
  return next;
}

function webStorage(remember: boolean): Storage | null {
  if (typeof window === "undefined") return null;
  return remember ? window.localStorage : window.sessionStorage;
}

async function readTokenNow(): Promise<string | null> {
  if (volatileToken) return volatileToken;
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(TOKEN_KEY) ?? window.localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function readUserIdNow(): Promise<string | null> {
  if (volatileUserId) return volatileUserId;
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(USER_ID_KEY) ?? window.localStorage.getItem(USER_ID_KEY);
  }
  return SecureStore.getItemAsync(USER_ID_KEY);
}

async function clearTokenNow(): Promise<void> {
  volatileToken = null;
  volatileUserId = null;
  volatileUserSnapshot = null;
  volatileSessionOnly = false;
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      for (const storage of [window.localStorage, window.sessionStorage]) {
        storage.removeItem(TOKEN_KEY);
        storage.removeItem(USER_ID_KEY);
        storage.removeItem(USER_SNAPSHOT_KEY);
      }
    }
    return;
  }
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_ID_KEY),
    SecureStore.deleteItemAsync(USER_SNAPSHOT_KEY),
  ]);
}

export const session = {
  async getToken(): Promise<string | null> {
    return serializeMutation(readTokenNow);
  },

  async getUserId(): Promise<string | null> {
    return serializeMutation(readUserIdNow);
  },

  async getUserSnapshot(): Promise<User | null> {
    return serializeMutation(async () => {
      if (volatileUserSnapshot) return volatileUserSnapshot;
      let raw: string | null = null;
      if (Platform.OS === "web") {
        if (typeof window === "undefined") return null;
        raw = window.sessionStorage.getItem(USER_SNAPSHOT_KEY) ?? window.localStorage.getItem(USER_SNAPSHOT_KEY);
      } else {
        raw = await SecureStore.getItemAsync(USER_SNAPSHOT_KEY);
      }
      if (!raw) return null;
      try {
        const value = JSON.parse(raw) as Partial<User>;
        if (typeof value.id !== "string" || typeof value.name !== "string" || typeof value.email !== "string" || typeof value.timezone !== "string") return null;
        return value as User;
      } catch {
        return null;
      }
    });
  },

  async saveUserSnapshot(user: User, expectedToken?: string): Promise<void> {
    await serializeMutation(async () => {
      const currentToken = await readTokenNow();
      if (expectedToken !== undefined && currentToken !== expectedToken) return;
      volatileUserSnapshot = user;
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
          const storage = window.sessionStorage.getItem(TOKEN_KEY) ? window.sessionStorage : window.localStorage;
          storage.setItem(USER_SNAPSHOT_KEY, JSON.stringify(user));
        }
        return;
      }
      if (volatileSessionOnly) return;
      await SecureStore.setItemAsync(USER_SNAPSHOT_KEY, JSON.stringify(user));
    });
  },

  async saveToken(token: string, user: User, remember = true): Promise<void> {
    await serializeMutation(async () => {
      await clearTokenNow();
      if (!remember) {
        // Native memory-only credentials disappear when the app process restarts.
        // On web, sessionStorage survives reloads but not closing the tab/window.
        if (Platform.OS === "web") {
          const storage = webStorage(false);
          storage?.setItem(TOKEN_KEY, token);
          storage?.setItem(USER_ID_KEY, user.id);
          storage?.setItem(USER_SNAPSHOT_KEY, JSON.stringify(user));
        } else {
          volatileSessionOnly = true;
          volatileToken = token;
          volatileUserId = user.id;
          volatileUserSnapshot = user;
        }
        return;
      }

      volatileSessionOnly = false;
      if (Platform.OS === "web") {
        const storage = webStorage(true);
        storage?.setItem(TOKEN_KEY, token);
        storage?.setItem(USER_ID_KEY, user.id);
        storage?.setItem(USER_SNAPSHOT_KEY, JSON.stringify(user));
        return;
      }

      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_ID_KEY, user.id);
      await SecureStore.setItemAsync(USER_SNAPSHOT_KEY, JSON.stringify(user));
    });
  },

  async clearToken(): Promise<void> {
    await serializeMutation(clearTokenNow);
  },

  async clearTokenIfCurrent(expectedToken: string): Promise<boolean> {
    return serializeMutation(async () => {
      if ((await readTokenNow()) !== expectedToken) return false;
      await clearTokenNow();
      return true;
    });
  },
};
