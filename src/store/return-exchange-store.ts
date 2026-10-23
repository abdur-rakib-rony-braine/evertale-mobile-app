import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ReturnExchangeState {
  currentOrder: any | null;
  returnReason: string;
  selectedProducts: any[];
  newProducts: any[];
  exchangeData: any | null;
  isProcessing: boolean;
  setCurrentOrder: (order: any) => void;
  setReturnReason: (reason: string) => void;
  clearSelectedProducts: () => void;
  clearNewProducts: () => void;
  setProcessing: (isProcessing: boolean) => void;
  setSelectedProducts: (products: any[]) => void;
  addSelectedProduct: (product: any) => void;
  addNewProduct: (product: any) => void;
  removeSelectedProduct: (productId: string, size: string) => void;
  removeNewProduct: (productId: string, size: string) => void;
  updateNewProductQuantity: (productId: string, size: string, quantity: number) => void;
  updateSelectedProducts: (products: any[]) => void;
  updateNewProducts: (products: any[]) => void;
  setExchangeData: (data: any) => void;
  createExchangeData: (orderId: string) => any;
  getAvailableItems: () => any[];
  reset: () => void;
}

export const useReturnExchangeStore = create<ReturnExchangeState>()(
  persist(
    (set, get) => ({
      currentOrder: null,
      returnReason: "",
      selectedProducts: [],
      newProducts: [],
      exchangeData: null,
      isProcessing: false,

      setCurrentOrder: (order) => set({ currentOrder: order }),
      setReturnReason: (reason) => set({ returnReason: reason }),
      clearSelectedProducts: () => set({ selectedProducts: [] }),
      clearNewProducts: () => set({ newProducts: [] }),
      setProcessing: (isProcessing) => set({ isProcessing }),
      setSelectedProducts: (products) => set({ selectedProducts: products }),
      
      addSelectedProduct: (product) => set((state) => {
        const productKey = `${product.productId}-${product.size}`;
        const existing = state.selectedProducts.find(p => 
          `${p.productId}-${p.size}` === productKey
        );
        if (existing) {
          return {
            selectedProducts: state.selectedProducts.filter(p => 
              `${p.productId}-${p.size}` !== productKey
            )
          };
        }
        return {
          selectedProducts: [...state.selectedProducts, product]
        };
      }),

      addNewProduct: (product) => set((state) => {
        const productKey = `${product.productId}-${product.size}`;
        const existing = state.newProducts.find(p => 
          `${p.productId}-${p.size}` === productKey
        );
        
        if (existing) {
          return {
            newProducts: state.newProducts.map(p => 
              `${p.productId}-${p.size}` === productKey
                ? { ...p, quantity: p.quantity + 1 }
                : p
            )
          };
        }
        
        return {
          newProducts: [...state.newProducts, { ...product, quantity: 1 }]
        };
      }),

      removeSelectedProduct: (productId, size) => set((state) => ({
        selectedProducts: state.selectedProducts.filter(p => 
          !(p.productId === productId && p.size === size)
        )
      })),

      removeNewProduct: (productId, size) => set((state) => ({
        newProducts: state.newProducts.filter(p => 
          !(p.productId === productId && p.size === size)
        )
      })),

      updateNewProductQuantity: (productId, size, quantity) => set((state) => ({
        newProducts: state.newProducts.map(p => 
          p.productId === productId && p.size === size
            ? { ...p, quantity: Math.max(1, quantity) }
            : p
        )
      })),

      updateSelectedProducts: (products) => set({ selectedProducts: products }),
      updateNewProducts: (products) => set({ newProducts: products }),
      setExchangeData: (data) => set({ exchangeData: data }),

      createExchangeData: (orderId) => {
        const { newProducts, selectedProducts } = get();
        const exchangeData = {
          orderId,
          newProducts,
          selectedProducts,
          reason: 'Product Exchange'
        };
        set({ exchangeData });
        return exchangeData;
      },

      getAvailableItems: () => {
        const { currentOrder } = get();
        if (!currentOrder?.orderProducts) return [];

        return currentOrder.orderProducts.filter((product: any) => {
          const returned = currentOrder.returns?.reduce((sum: number, r: any) => {
            const found = r.returnItems?.find(
              (i: any) => i.productId === product.productId && i.size === product.size
            );
            return sum + (found ? found.quantity : 0);
          }, 0) || 0;
          return returned < product.quantity;
        });
      },

      reset: () => set({
        currentOrder: null,
        returnReason: '',
        selectedProducts: [],
        newProducts: [],
        exchangeData: null,
        isProcessing: false,
      }),
    }),
    {
      name: 'return-exchange-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        exchangeData: state.exchangeData,
        selectedProducts: state.selectedProducts,
        newProducts: state.newProducts,
      }),
    }
  )
);