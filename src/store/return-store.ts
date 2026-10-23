import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ReturnState {
  currentOrder: any | null;
  returnReason: string;
  availableItems: any[];
  selectedProducts: any[];
  shippingMethod: any | null;
  isProcessing: boolean;
  setCurrentOrder: (order: any) => void;
  setReturnReason: (reason: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setShippingMethod: (method: any) => void;
  toggleSelectedProduct: (product: any) => void;
  reset: () => void;
}

export const useReturnStore = create<ReturnState>()(
  persist(
    (set) => ({
      currentOrder: null,
      returnReason: "",
      availableItems: [],
      selectedProducts: [],
      shippingMethod: null,
      isProcessing: false,

      setCurrentOrder: (order) =>
        set({
          currentOrder: order,
          availableItems: order?.returnableProducts || [],
          selectedProducts: [],
          returnReason: "",
        }),

      setReturnReason: (reason) => set({ returnReason: reason }),
      setProcessing: (isProcessing) => set({ isProcessing }),
      setShippingMethod: (method) => set({ shippingMethod: method }),

      toggleSelectedProduct: (product) =>
        set((state) => {
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

      reset: () =>
        set({
          currentOrder: null,
          availableItems: [],
          selectedProducts: [],
          returnReason: "",
          shippingMethod: null,
          isProcessing: false,
        }),
    }),
    {
      name: "return-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedProducts: state.selectedProducts,
      }),
    }
  )
);