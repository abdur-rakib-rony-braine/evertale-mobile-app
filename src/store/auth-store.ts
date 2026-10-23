import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { urls } from "@/constants/url";

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  user_role: string;
  profilePicture?: string;
  phone?: string;
  address?: string;
  address2?: string;
  suburb?: string;
  postcode?: string;
  state?: string;
  country?: string;
   dob?: string | null;
  isVerified?: boolean;
  subscriber?: boolean;
  twoFactorEnabled?: boolean;
  totalOrder?: number;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  loadSession: async () => {
    try {
      const token = await SecureStore.getItemAsync("user-token");
      const userDataStr = await SecureStore.getItemAsync("user-data");

      if (token && userDataStr) {
        set({ token, user: JSON.parse(userDataStr) });
      }
    } catch (error) {
      console.log("Failed to load session", error);
    } finally {
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${urls.api.base}/api/auth/mobile-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || "Login failed" };
      }

      await SecureStore.setItemAsync("user-token", data.token);
      await SecureStore.setItemAsync("user-data", JSON.stringify(data.user));

      set({ token: data.token, user: data.user });
      return { success: true };
    } catch (error) {
      return { success: false, message: "Network error. Please try again." };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync("user-token");
      await SecureStore.deleteItemAsync("user-data");
    } catch (error) {
      console.log("Failed to delete session", error);
    } finally {
      set({ token: null, user: null });
    }
  },

  updateUser: (updatedFields) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const newUser = { ...currentUser, ...updatedFields };
    set({ user: newUser });
    SecureStore.setItemAsync("user-data", JSON.stringify(newUser));
  },
}));