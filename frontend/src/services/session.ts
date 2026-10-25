import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "study_planner_access_token";

export const session = {
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async clearToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};