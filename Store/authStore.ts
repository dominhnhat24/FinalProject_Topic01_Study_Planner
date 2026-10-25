import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface User {
  username: string;
  fullName?: string;
}

interface AuthState {
  token: string | null;
  currentUser: User | null;
  registeredUsers: { username: string; password: string; fullName?: string }[];
  registerUser: (username: string, password: string, fullName?: string) => Promise<{ success: boolean; message: string }>;
  signIn: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
}

const saveStorage = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getStorage = async (key: string) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const removeStorage = async (key: string) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  currentUser: null,
  registeredUsers: [],

  // Đăng ký tài khoản thực
  registerUser: async (username, password, fullName) => {
    const rawUsers = await getStorage('registered_users');
    const users = rawUsers ? JSON.parse(rawUsers) : [];

    const existingUser = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
      return { success: false, message: 'Tài khoản/Mã sinh viên này đã tồn tại!' };
    }

    const newUser = { username, password, fullName: fullName || username };
    const updatedUsers = [...users, newUser];

    await saveStorage('registered_users', JSON.stringify(updatedUsers));
    set({ registeredUsers: updatedUsers });

    return { success: true, message: 'Đăng ký tài khoản thành công!' };
  },

  // Đăng nhập xác thực thông tin
  signIn: async (username, password) => {
    const rawUsers = await getStorage('registered_users');
    const users = rawUsers ? JSON.parse(rawUsers) : [];

    const matchedUser = users.find(
      (u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!matchedUser) {
      return { success: false, message: 'Tài khoản hoặc mật khẩu không chính xác!' };
    }

    const token = `token_${matchedUser.username}_${Date.now()}`;
    const userSession: User = { username: matchedUser.username, fullName: matchedUser.fullName };

    await saveStorage('user_token', token);
    await saveStorage('current_user', JSON.stringify(userSession));

    set({ token, currentUser: userSession });
    return { success: true, message: 'Đăng nhập thành công!' };
  },

  // Khôi phục phiên làm việc khi F5/Tắt app
  loadSession: async () => {
    const token = await getStorage('user_token');
    const rawUser = await getStorage('current_user');
    if (token && rawUser) {
      set({ token, currentUser: JSON.parse(rawUser) });
    }
  },

  // Đăng xuất
  signOut: async () => {
    await removeStorage('user_token');
    await removeStorage('current_user');
    set({ token: null, currentUser: null });
  },
}));