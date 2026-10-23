import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface WishlistEntry {
  productId: string;
  handle: string;
  subCategory?: string;
}

interface WishlistState {
  items: WishlistEntry[];
  count: number;
  toggle: (entry: WishlistEntry) => void;
  add: (entry: WishlistEntry) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,

      toggle: (entry) => {
        const items = get().items;
        const exists = items.some((i) => i.productId === entry.productId);
        const next = exists
          ? items.filter((i) => i.productId !== entry.productId)
          : [...items, entry];
        set({ items: next, count: next.length });
      },

      add: (entry) => {
        const items = get().items;
        if (items.some((i) => i.productId === entry.productId)) return;
        const next = [...items, entry];
        set({ items: next, count: next.length });
      },

      remove: (productId) => {
        const next = get().items.filter((i) => i.productId !== productId);
        set({ items: next, count: next.length });
      },

      clear: () => set({ items: [], count: 0 }),
    }),
    {
      name: "evertale-wishlist",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);