import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export interface Assignment {
  id: string;
  courseName: string;
  title: string;
  dueAt: string;
  status: 'PENDING' | 'COMPLETED';
  username: string;
}

interface PlannerState {
  assignments: Assignment[];
  loadAssignments: (username: string) => Promise<void>;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'status'>) => Promise<void>;
  toggleStatus: (id: string, username: string) => Promise<void>;
  deleteAssignment: (id: string, username: string) => Promise<void>;
}

const STORAGE_KEY = 'study_planner_assignments';

const getStorageData = async (): Promise<Assignment[]> => {
  let dataRaw: string | null = null;
  if (Platform.OS === 'web') {
    dataRaw = localStorage.getItem(STORAGE_KEY);
  } else {
    dataRaw = await SecureStore.getItemAsync(STORAGE_KEY);
  }
  return dataRaw ? JSON.parse(dataRaw) : [];
};

const saveStorageData = async (data: Assignment[]) => {
  const jsonString = JSON.stringify(data);
  if (Platform.OS === 'web') {
    localStorage.setItem(STORAGE_KEY, jsonString);
  } else {
    await SecureStore.setItemAsync(STORAGE_KEY, jsonString);
  }
};

export const usePlannerStore = create<PlannerState>((set, get) => ({
  assignments: [],

  loadAssignments: async (username: string) => {
    const all = await getStorageData();
    const userAssignments = all.filter((item) => item.username === username);
    set({ assignments: userAssignments });
  },

  addAssignment: async (item) => {
    const all = await getStorageData();
    const newAssignment: Assignment = {
      ...item,
      id: Date.now().toString(),
      status: 'PENDING',
    };
    const updatedAll = [newAssignment, ...all];
    await saveStorageData(updatedAll);

    // Cập nhật lại danh sách hiện tại của user
    const userOnly = updatedAll.filter((a) => a.username === item.username);
    set({ assignments: userOnly });
  },

  toggleStatus: async (id, username) => {
    const all = await getStorageData();
    const updatedAll = all.map((item) => {
      if (item.id === id && item.username === username) {
        return {
          ...item,
          status: item.status === 'PENDING' ? 'COMPLETED' : 'PENDING',
        } as Assignment;
      }
      return item;
    });

    await saveStorageData(updatedAll);
    const userOnly = updatedAll.filter((a) => a.username === username);
    set({ assignments: userOnly });
  },

  deleteAssignment: async (id, username) => {
    const all = await getStorageData();
    const updatedAll = all.filter((item) => !(item.id === id && item.username === username));

    await saveStorageData(updatedAll);
    const userOnly = updatedAll.filter((a) => a.username === username);
    set({ assignments: userOnly });
  },
}));