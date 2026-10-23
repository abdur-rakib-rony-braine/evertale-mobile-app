import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ExchangeState {
  currentOrder: any | null;
  selectedProducts: any[];
  newProducts: any[];
  exchangeData: any | null;
  setCurrentOrder: (order: any) => void;
  getAvailableProducts: () => any[];
  getRemainingExchanges: () => number;
  isOrderEligibleForExchange: () => boolean;
  isProductExchangeable: (product: any) => boolean;
  setSelectedProducts: (products: any[]) => void;
  addSelectedProduct: (product: any) => void;
  removeSelectedProduct: (productId: string, size: string) => void;
  addNewProduct: (product: any) => void;
  updateNewProductQuantity: (productId: string, size: string, quantity: number) => void;
  removeNewProduct: (productId: string, size: string) => void;
  createExchangeData: (reason?: string) => any | null;
  reset: () => void;
}

export const useExchangeStore = create<ExchangeState>()(
  persist(
    (set, get) => ({
      currentOrder: null,
      selectedProducts: [],
      newProducts: [],
      exchangeData: null,

      setCurrentOrder: (order) => set({ currentOrder: order }),

      getAvailableProducts: () => {
        const { currentOrder } = get();
        if (!currentOrder) return [];
        // Assuming currentOrder.exchangeableProducts contains the eligible items
        return currentOrder.exchangeableProducts || [];
      },

      getRemainingExchanges: () => {
        const { currentOrder } = get();
        if (!currentOrder) return 0;
        const availableProducts = get().getAvailableProducts();
        return availableProducts.length;
      },

      isOrderEligibleForExchange: () => {
        const { currentOrder } = get();
        if (!currentOrder) return false;
        // Basic check: ensure order is within 30 days and has exchangeable items
        const withinWindow = new Date(currentOrder.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return withinWindow && (currentOrder.exchangeableProducts?.length > 0);
      },

      isProductExchangeable: (product) => {
        const { currentOrder } = get();
        if (!currentOrder || !product) return false;
        // Check if the product exists in the exchangeable list
        return currentOrder.exchangeableProducts?.some(
          (p: any) => p.productId === product.productId && p.size === product.size
        );
      },

      setSelectedProducts: (products) => set({ selectedProducts: products }),

      addSelectedProduct: (product) =>
        set((state) => {
          if (!state.isOrderEligibleForExchange()) return state;
          if (!state.isProductExchangeable(product)) return state;

          const key = `${product.productId}-${product.size}`;
          const exists = state.selectedProducts.some(
            (p) => `${p.productId}-${p.size}` === key
          );

          return {
            selectedProducts: exists
              ? state.selectedProducts.filter(
                  (p) => `${p.productId}-${p.size}` !== key
                )
              : [...state.selectedProducts, product],
          };
        }),

      removeSelectedProduct: (productId, size) =>
        set((state) => ({
          selectedProducts: state.selectedProducts.filter(
            (p) => !(p.productId === productId && p.size === size)
          ),
        })),

      addNewProduct: (product) =>
        set((state) => {
          const key = `${product.productId}-${product.size}`;
          const exists = state.newProducts.find(
            (p) => `${p.productId}-${p.size}` === key
          );

          if (exists) {
            return {
              newProducts: state.newProducts.map((p) =>
                `${p.productId}-${p.size}` === key
                  ? { ...p, quantity: p.quantity + 1 }
                  : p
              ),
            };
          }

          return {
            newProducts: [...state.newProducts, { ...product, quantity: 1 }],
          };
        }),

      updateNewProductQuantity: (productId, size, quantity) =>
        set((state) => ({
          newProducts: state.newProducts.map((p) =>
            p.productId === productId && p.size === size
              ? { ...p, quantity: Math.max(1, quantity) }
              : p
          ),
        })),

      removeNewProduct: (productId, size) =>
        set((state) => ({
          newProducts: state.newProducts.filter(
            (p) => !(p.productId === productId && p.size === size)
          ),
        })),

      createExchangeData: (reason = "Product Exchange") => {
        const state = get();
        const { selectedProducts, newProducts, currentOrder } = state;

        if (!currentOrder) return null;

        const exchangeData = {
          orderId: currentOrder.orderId,
          oldProducts: selectedProducts,
          newProducts: newProducts,
          reason,
        };

        set({ exchangeData });
        return exchangeData;
      },

      reset: () =>
        set({
          currentOrder: null,
          selectedProducts: [],
          newProducts: [],
          exchangeData: null,
        }),
    }),
    {
      name: "exchange-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentOrder: state.currentOrder,
        selectedProducts: state.selectedProducts,
        newProducts: state.newProducts,
        exchangeData: state.exchangeData,
      }),
    }
  )
);