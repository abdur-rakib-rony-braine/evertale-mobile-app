import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Product } from "@/lib/api/products";

export interface CartItem {
  productId: string;
  title: string;
  featured_image: string;
  price: number;
  productSize: string;
  availableSizes: { name: string; stockQuantity: number }[];
  quantity: number;
  subCategory: string;
  handle: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  addToCart: (product: Product, size: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, size: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, size: string) => Promise<void>;
  clearCart: () => void;
}

const computeTotals = (items: CartItem[]) => ({
  totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
  totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      isLoading: false,

      addToCart: async (product, size, quantity = 1) => {
        const sizeInfo = product.sizes?.find((s) => s.name === size);
        if (!sizeInfo) return false;

        const existing = get().items.find(
          (i) => i.productId === product._id && i.productSize === size
        );

        const nextQty = (existing?.quantity ?? 0) + quantity;
        if (sizeInfo.stockQuantity < nextQty) return false;

        let nextItems: CartItem[];

        if (existing) {
          nextItems = get().items.map((i) =>
            i.productId === product._id && i.productSize === size
              ? { ...i, quantity: nextQty }
              : i
          );
        } else {
          const newItem: CartItem = {
            productId: product._id,
            title: product.title,
            featured_image: product.featured_image || product.images?.[0] || "",
            price:
              product.discounted_price && product.discounted_price > 0
                ? product.discounted_price
                : product.price,
            productSize: size,
            availableSizes: product.sizes,
            quantity,
            subCategory: product.subCategory || "",
            handle: product.handle,
          };
          nextItems = [...get().items, newItem];
        }

        set({ items: nextItems, ...computeTotals(nextItems) });
        return true;
      },

      updateQuantity: async (productId, size, quantity) => {
        if (quantity <= 0) {
          const nextItems = get().items.filter(
            (i) => !(i.productId === productId && i.productSize === size)
          );
          set({ items: nextItems, ...computeTotals(nextItems) });
          return;
        }

        const item = get().items.find(
          (i) => i.productId === productId && i.productSize === size
        );
        if (!item) return;

        const sizeInfo = item.availableSizes?.find((s) => s.name === size);
        if (sizeInfo && sizeInfo.stockQuantity < quantity) return;

        const nextItems = get().items.map((i) =>
          i.productId === productId && i.productSize === size
            ? { ...i, quantity }
            : i
        );
        set({ items: nextItems, ...computeTotals(nextItems) });
      },

      removeFromCart: async (productId, size) => {
        const nextItems = get().items.filter(
          (i) => !(i.productId === productId && i.productSize === size)
        );
        set({ items: nextItems, ...computeTotals(nextItems) });
      },

      clearCart: () => set({ items: [], totalItems: 0, totalAmount: 0 }),
    }),
    {
      name: "evertale-cart",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state?.items) {
          const { totalItems, totalAmount } = computeTotals(state.items);
          state.totalItems = totalItems;
          state.totalAmount = totalAmount;
        }
      },
    }
  )
);