import { create } from "zustand";
import { apiClient } from "@/lib/api/client";

export const useDiscountStore = create<any>((set, get) => ({
  discountCode: "",
  discountData: null,
  appliedDiscount: 0,
  discountedTotal: 0,
  freeShipping: false,
  isLoading: false,
  error: null,
  isCheckingAutomatic: false,
  lastCheckedCart: null,

  checkAutomaticDiscounts: async (cartData: any) => {
    const cart = cartData.cart || cartData;
    const cartKey = JSON.stringify(cart?.items?.map((i: any) => i.productId) || []);

    if (get().isCheckingAutomatic || get().lastCheckedCart === cartKey) {
      return { freeShipping: get().freeShipping };
    }

    if (!cart || !cart?.items || cart?.items.length === 0) {
      set({ freeShipping: false, lastCheckedCart: cartKey });
      return { freeShipping: false };
    }

    set({ isCheckingAutomatic: true, lastCheckedCart: cartKey });
    try {
      const { data } = await apiClient.post("/api/check-automatic-discounts", {
        cart,
      });

      set({ freeShipping: data.freeShipping || false, isCheckingAutomatic: false });
      return { freeShipping: data.freeShipping || false };
    } catch (error) {
      set({ freeShipping: false, isCheckingAutomatic: false });
      return { freeShipping: false };
    }
  },

  applyDiscount: async (cart: any, code: string, customerId: string | null = null) => {
    set({ isLoading: true, error: null });
    try {
      const autoResult = await get().checkAutomaticDiscounts(cart);
      const hasFreeShipping = autoResult.freeShipping;

      const { data } = await apiClient.post("/api/apply-discount", {
        cart,
        discountCode: code,
        customerId,
      });

      set({
        isLoading: false,
        discountCode: code,
        discountData: data,
        appliedDiscount: data.appliedDiscount || 0,
        discountedTotal: data.finalTotal || 0,
        freeShipping: hasFreeShipping || data.freeShipping || false,
        error: null,
      });

      return { success: true, data };
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.error || 
        error.message || 
        "Failed to apply discount";

      set({
        isLoading: false,
        error: errorMessage,
        discountData: null,
        appliedDiscount: 0,
        discountedTotal: 0,
        freeShipping: false,
        discountCode: "",
      });
      return { success: false, error: errorMessage };
    }
  },

  removeDiscount: () => {
    set({
      discountCode: "",
      discountData: null,
      appliedDiscount: 0,
      discountedTotal: 0,
      freeShipping: false,
      error: null,
      isLoading: false,
      isCheckingAutomatic: false,
    });
  },

  clearError: () => set({ error: null }),
  resetFreeShipping: () => set({ freeShipping: false }),
}));