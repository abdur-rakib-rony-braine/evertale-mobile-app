import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from "react-native-toast-message";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { apiClient } from "@/lib/api/client";

export interface WishlistItem {
  productId: string;
  title: string;
  featured_image: string;
  price: number;
  compareAtPrice?: number;
  handle: string;
  subCategory?: string;
  sizes: { name: string; stockQuantity: number }[];
  productType?: string;
}

interface WishlistState {
  items: WishlistItem[];
  localWishlist: WishlistItem[];
  count: number;
  isLoading: boolean;
  _lastUserId: string | null;

  loadGuestWishlist: () => void;
  fetchWishlist: () => Promise<void>;
  transferGuestWishlistToUser: (userId: string | null | undefined) => Promise<void>;

  add: (item: WishlistItem, userId?: string | null) => Promise<boolean>;
  remove: (productId: string, userId?: string | null) => Promise<void>;
  toggle: (item: WishlistItem, userId?: string | null) => Promise<boolean>;
  clear: (userId?: string | null) => void;
  updateCount: (count: number) => void;

  isInWishlist: (productId: string, userId?: string | null) => boolean;
  getActiveItems: (userId?: string | null) => WishlistItem[];
  onSessionChange: (userId: string | null | undefined) => Promise<void>;
}

const API_PREFIX = "/api";

const showSuccess = (message: string) =>
  Toast.show({ type: "success", text1: message });

const showError = (message: string) =>
  Toast.show({ type: "error", text1: message });

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

const isSame = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const normalizeServerItem = (raw: any): WishlistItem => ({
  productId: String(raw.productId),
  title: raw.title || "",
  featured_image: raw.featured_image || "",
  price: Number(raw.price) || 0,
  compareAtPrice: raw.compareAtPrice,
  handle: raw.handle || "",
  subCategory: raw.subCategory || "",
  sizes: raw.sizes || [],
  productType: raw.productType,
});

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      localWishlist: [],
      count: 0,
      isLoading: false,
      _lastUserId: null,

      loadGuestWishlist: () => {
        const local = get().localWishlist;
        set({ count: local.length });
      },

      fetchWishlist: async () => {
        try {
          const { data } = await apiClient.get(`${API_PREFIX}/wishlist`);
          const serverItems: WishlistItem[] = (data.items || []).map(normalizeServerItem);

          if (!isSame(serverItems, get().items)) {
            set({ items: serverItems, count: serverItems.length });
          } else {
            set({ count: serverItems.length });
          }
        } catch (error) {
          console.log("Error fetching wishlist:", error);
        }
      },

      transferGuestWishlistToUser: async (userId) => {
        if (!userId) return;

        const guestItems = get().localWishlist;
        if (guestItems.length === 0) return;

        set({ isLoading: true });
        try {
          const results = await Promise.allSettled(
            guestItems.map((item) =>
              apiClient.post(`${API_PREFIX}/wishlist`, { productId: item.productId })
            )
          );

          const failed = results.filter((r) => r.status === "rejected").length;

          set({ localWishlist: [] });
          await get().fetchWishlist();

          if (failed < guestItems.length) {
            showSuccess("Wishlist restored to your account");
          } else {
            showError("Error transferring wishlist items");
          }
        } catch (error) {
          console.log("Error transferring wishlist:", error);
          showError("Error transferring wishlist items");
        } finally {
          set({ isLoading: false });
        }
      },

      add: async (item, userId) => {
        if (!userId) {
          const local = get().localWishlist;
          if (local.some((i) => i.productId === item.productId)) return true;
          const next = [...local, item];
          set({ localWishlist: next, count: next.length });
          showSuccess("Added to wishlist");
          return true;
        }

        const previous = get().items;
        if (previous.some((i) => i.productId === item.productId)) return true;

        const next = [...previous, item];
        set({ items: next, count: next.length });

        try {
          await apiClient.post(`${API_PREFIX}/wishlist`, { productId: item.productId });
          showSuccess("Added to wishlist");
          return true;
        } catch (error) {
          set({ items: previous, count: previous.length });
          showError(getErrorMessage(error, "Error adding to wishlist"));
          return false;
        }
      },

      remove: async (productId, userId) => {
        if (!userId) {
          const next = get().localWishlist.filter((i) => i.productId !== productId);
          set({ localWishlist: next, count: next.length });
          showSuccess("Removed from wishlist");
          return;
        }

        const previous = get().items;
        const next = previous.filter((i) => i.productId !== productId);
        set({ items: next, count: next.length });

        try {
          await apiClient.delete(`${API_PREFIX}/wishlist`, { data: { productId } });
          showSuccess("Removed from wishlist");
        } catch (error) {
          set({ items: previous, count: previous.length });
          showError(getErrorMessage(error, "Error removing from wishlist"));
        }
      },

      toggle: async (item, userId) => {
        const exists = get().isInWishlist(item.productId, userId);
        if (exists) {
          await get().remove(item.productId, userId);
          return false;
        }
        return get().add(item, userId);
      },

      clear: (userId) => {
        if (!userId) {
          set({ localWishlist: [], count: 0 });
          return;
        }
        set({ items: [], count: 0 });
      },

      updateCount: (count) => set({ count }),

      isInWishlist: (productId, userId) => {
        const list = userId ? get().items : get().localWishlist;
        return list.some((i) => i.productId === productId);
      },

      getActiveItems: (userId) => (userId ? get().items : get().localWishlist),

      onSessionChange: async (userId) => {
        await waitForHydration();

        if (!userId) {
          set({ _lastUserId: null, items: [] });
          get().loadGuestWishlist();
          return;
        }

        if (get()._lastUserId !== userId) {
          set({ _lastUserId: userId });
          await get().transferGuestWishlistToUser(userId);
        }

        await get().fetchWishlist();
      },
    }),
    {
      name: "evertale-wishlist",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ localWishlist: state.localWishlist }),
    }
  )
);

function waitForHydration() {
  return new Promise<void>((resolve) => {
    if (useWishlistStore.persist.hasHydrated()) {
      resolve();
      return;
    }
    const unsubscribe = useWishlistStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}