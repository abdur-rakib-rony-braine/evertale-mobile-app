import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { apiClient } from "@/lib/api/client";
import { Product } from "@/lib/api/products";

export interface CartItem {
  productId: string;
  title: string;
  featured_image?: string;
  price: number;
  productSize: string;
  availableSizes: { name: string; stockQuantity: number }[];
  quantity: number;
  subCategory?: string;
  handle: string;
  hasUpdates?: boolean;
}

interface CartState {
  cartItems: CartItem[];
  localCart: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  hasSynced: boolean;
  _lastUserId: string | null;
  _intervalId: ReturnType<typeof setInterval> | null;

  loadGuestCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  transferGuestCartToUserCart: (userId: string | null | undefined) => Promise<void>;

  addToCart: (product: Product, size: string, quantity?: number, userId?: string | null) => Promise<boolean>;
  updateQuantity: (productId: string, size: string, quantity: number, userId?: string | null) => Promise<void>;
  changeSize: (productId: string, currentSize: string, newSize: string, quantity: number, userId?: string | null) => Promise<boolean>;
  removeFromCart: (productId: string, size: string, userId?: string | null) => Promise<void>;
  clearCart: (userId?: string | null) => Promise<void>;
  refreshCart: (userId?: string | null, showToast?: boolean) => Promise<boolean>;
  proceedToCheckout: (userId?: string | null) => boolean;

  getActiveCartItems: (userId?: string | null) => CartItem[];
  getCartSummary: () => { totalItems: number; totalAmount: number; isLoading: boolean };
  startRefreshInterval: (userId?: string | null) => void;
  stopRefreshInterval: () => void;
  onSessionChange: (userId: string | null | undefined) => Promise<void>;
}

const API_PREFIX = "/api";

let sessionVersion = 0;

const computeTotals = (items: CartItem[]) => ({
  totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
  totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
});

const isValidItem = (item: CartItem) => {
  const sizeInfo = item.availableSizes?.find((s) => s.name === item.productSize);
  return Boolean(
    sizeInfo && sizeInfo.stockQuantity > 0 && item.quantity <= sizeInfo.stockQuantity
  );
};

const isSame = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

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

const refreshGuestCart = async (cartItems: CartItem[]): Promise<CartItem[]> => {
  try {
    const { data } = await apiClient.post(`${API_PREFIX}/cart/refresh-products`, {
      cartItems,
    });
    const updatedItems: CartItem[] = data.updatedItems || cartItems;
    return updatedItems.filter(isValidItem);
  } catch (error) {
    console.log("Error refreshing guest cart:", error);
    return cartItems;
  }
};

const toCartPayload = (product: Product, size: string, quantity: number): CartItem => ({
  productId: product._id,
  title: product.title,
  featured_image: product.featured_image,
  price: product.price,
  productSize: size,
  availableSizes: product.sizes,
  quantity,
  subCategory: product.subCategory,
  handle: product.handle,
});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      localCart: [],
      totalItems: 0,
      totalAmount: 0,
      isLoading: false,
      hasSynced: false,
      _lastUserId: null,
      _intervalId: null,

      loadGuestCart: async () => {
        const savedCart = get().localCart;

        if (savedCart.length === 0) {
          set({ localCart: [], cartItems: [], totalItems: 0, totalAmount: 0, hasSynced: true });
          return;
        }

        set({ isLoading: true, cartItems: [] });
        try {
          const refreshedCart = await refreshGuestCart(savedCart);
          set({ localCart: refreshedCart, ...computeTotals(refreshedCart) });
        } finally {
          set({ isLoading: false, hasSynced: true });
        }
      },

      fetchCart: async () => {
        const hasCached = get().cartItems.length > 0;
        if (!hasCached) set({ isLoading: true });

        try {
          const { data } = await apiClient.get(`${API_PREFIX}/cart`);
          const validItems: CartItem[] = (data.items || []).filter(isValidItem);

          if (!isSame(validItems, get().cartItems)) {
            set({ cartItems: validItems });
          }
          set(computeTotals(validItems));
        } catch (error) {
          console.log("Error fetching cart:", error);
        } finally {
          set({ isLoading: false, hasSynced: true });
        }
      },

      transferGuestCartToUserCart: async (userId) => {
        if (!userId) return;

        const guestCart = get().localCart;
        if (guestCart.length === 0) return;

        set({ isLoading: true });
        try {
          const refreshedCart = await refreshGuestCart(guestCart);

          const { data } = await apiClient.post(`${API_PREFIX}/cart/merge`, {
            items: refreshedCart,
          });

          set({
            cartItems: data.items,
            totalItems: data.totalItems,
            totalAmount: data.totalAmount,
            localCart: [],
          });

          showSuccess("Cart restored to your account");
        } catch (error) {
          console.log("Error transferring cart:", error);
          showError("Error transferring cart items");
        } finally {
          set({ isLoading: false });
        }
      },

      addToCart: async (product, size, quantity = 1, userId) => {
        if (!size) {
          showError("Please select a size");
          return false;
        }

        if (!userId) {
          const sizeInfo = product.sizes?.find((s) => s.name === size);

          if (!sizeInfo || sizeInfo.stockQuantity < quantity) {
            showError("Limited stock available");
            return false;
          }

          const localCart = get().localCart;
          const existingItemIndex = localCart.findIndex(
            (item) => item.productId === product._id && item.productSize === size
          );

          let updatedCart: CartItem[];

          if (existingItemIndex > -1) {
            const newQuantity = localCart[existingItemIndex].quantity + quantity;
            if (sizeInfo.stockQuantity < newQuantity) {
              showError("Limited stock available");
              return false;
            }
            updatedCart = localCart.map((item, index) =>
              index === existingItemIndex ? { ...item, quantity: newQuantity } : item
            );
          } else {
            updatedCart = [...localCart, toCartPayload(product, size, quantity)];
          }

          set({ localCart: updatedCart, ...computeTotals(updatedCart) });
          showSuccess("Added to cart");
          return true;
        }

        set({ isLoading: true });
        try {
          const existingItem = get().cartItems.find(
            (item) => item.productId === product._id && item.productSize === size
          );
          const sizeInfo = product.sizes?.find((s) => s.name === size);

          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (!sizeInfo || sizeInfo.stockQuantity < newQuantity) {
              throw new Error(
                `Cannot add ${quantity} more. Only ${sizeInfo?.stockQuantity || 0} items available in total.`
              );
            }
          } else if (!sizeInfo || sizeInfo.stockQuantity < quantity) {
            throw new Error(`Only ${sizeInfo?.stockQuantity || 0} items available`);
          }

          const { data } = await apiClient.post(
            `${API_PREFIX}/cart`,
            toCartPayload(product, size, quantity)
          );

          set({
            cartItems: data.items,
            totalItems: data.totalItems,
            totalAmount: data.totalAmount,
          });

          showSuccess("Added to cart");
          return true;
        } catch (error) {
          showError(getErrorMessage(error, "Error adding to cart"));
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (productId, size, quantity, userId) => {
        if (!userId) {
          const localCart = get().localCart;

          if (quantity <= 0) {
            const updatedCart = localCart.filter(
              (item) => !(item.productId === productId && item.productSize === size)
            );
            set({ localCart: updatedCart, ...computeTotals(updatedCart) });
            return;
          }

          const itemIndex = localCart.findIndex(
            (item) => item.productId === productId && item.productSize === size
          );
          if (itemIndex === -1) return;

          const item = localCart[itemIndex];
          const sizeInfo = item.availableSizes?.find((s) => s.name === size);

          if (!sizeInfo || sizeInfo.stockQuantity < quantity) {
            showError("Limited stock available");
            return;
          }

          const updatedCart = localCart.map((cartItem, index) =>
            index === itemIndex ? { ...cartItem, quantity } : cartItem
          );
          set({ localCart: updatedCart, ...computeTotals(updatedCart) });
          return;
        }

        set({ isLoading: true });
        try {
          const item = get().cartItems.find(
            (cartItem) => cartItem.productId === productId && cartItem.productSize === size
          );

          if (item) {
            const sizeInfo = item.availableSizes?.find((s) => s.name === size);
            if (!sizeInfo || sizeInfo.stockQuantity < quantity) {
              throw new Error(`Only ${sizeInfo?.stockQuantity || 0} items available`);
            }
          }

          const { data } = await apiClient.put(`${API_PREFIX}/cart`, {
            productId,
            productSize: size,
            quantity,
          });

          set({
            cartItems: data.items,
            totalItems: data.totalItems,
            totalAmount: data.totalAmount,
          });
        } catch (error) {
          console.log("Error updating cart:", error);
          showError(getErrorMessage(error, "Error updating cart"));
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      changeSize: async (productId, currentSize, newSize, quantity, userId) => {
        if (currentSize === newSize) return false;

        if (!userId) {
          const localCart = get().localCart;
          const itemIndex = localCart.findIndex(
            (item) => item.productId === productId && item.productSize === currentSize
          );

          if (itemIndex === -1) {
            showError("Item not found");
            return false;
          }

          const item = localCart[itemIndex];
          const newSizeInfo = item.availableSizes?.find((s) => s.name === newSize);

          if (!newSizeInfo || newSizeInfo.stockQuantity < quantity) {
            showError("Limited stock available");
            return false;
          }

          const existingNewSizeItemIndex = localCart.findIndex(
            (cartItem) => cartItem.productId === productId && cartItem.productSize === newSize
          );

          let updatedCart: CartItem[];

          if (existingNewSizeItemIndex > -1) {
            const newTotalQuantity = localCart[existingNewSizeItemIndex].quantity + quantity;

            if (newSizeInfo.stockQuantity < newTotalQuantity) {
              showError("Limited stock available");
              return false;
            }

            updatedCart = localCart
              .map((cartItem, index) =>
                index === existingNewSizeItemIndex
                  ? { ...cartItem, quantity: newTotalQuantity }
                  : cartItem
              )
              .filter((_, index) => index !== itemIndex);
          } else {
            updatedCart = localCart.map((cartItem, index) =>
              index === itemIndex ? { ...cartItem, productSize: newSize } : cartItem
            );
          }

          set({ localCart: updatedCart, ...computeTotals(updatedCart) });
          showSuccess("Size updated");
          return true;
        }

        set({ isLoading: true });
        try {
          const { data } = await apiClient.put(`${API_PREFIX}/cart/change-size`, {
            productId,
            currentSize,
            newSize,
            quantity,
          });

          set({
            cartItems: data.items,
            totalItems: data.totalItems,
            totalAmount: data.totalAmount,
          });

          showSuccess("Size updated");
          return true;
        } catch (error) {
          console.log("Error changing size:", error);
          showError(getErrorMessage(error, "Error changing size"));
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromCart: async (productId, size, userId) => {
        if (!userId) {
          const updatedCart = get().localCart.filter(
            (item) => !(item.productId === productId && item.productSize === size)
          );
          set({ localCart: updatedCart, ...computeTotals(updatedCart) });
          showSuccess("Item removed");
          return;
        }

        set({ isLoading: true });
        try {
          const { data } = await apiClient.delete(`${API_PREFIX}/cart`, {
            data: { productId, productSize: size },
          });

          set({
            cartItems: data.items,
            totalItems: data.totalItems,
            totalAmount: data.totalAmount,
          });

          showSuccess("Item removed");
        } catch (error) {
          console.error("Error removing from cart:", error);
          showError("Error removing item");
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async (userId) => {
        if (!userId) {
          set({ localCart: [], totalItems: 0, totalAmount: 0 });
          showSuccess("Cart cleared");
          return;
        }

        set({ isLoading: true });
        try {
          await apiClient.patch(`${API_PREFIX}/cart`);

          set({ cartItems: [], totalItems: 0, totalAmount: 0 });
          showSuccess("Cart cleared");
        } catch (error) {
          console.log("Error clearing cart:", error);
          showError("Error clearing cart");
        } finally {
          set({ isLoading: false });
        }
      },

      refreshCart: async (userId, showToast = false) => {
        if (!userId && get().localCart.length > 0) {
          set({ isLoading: true });
          try {
            const originalLocalCart = [...get().localCart];

            const { data } = await apiClient.post(`${API_PREFIX}/cart/refresh-products`, {
              cartItems: originalLocalCart,
            });

            const refreshedCart: CartItem[] = data.updatedItems || originalLocalCart;
            const validItems = refreshedCart.filter(isValidItem);

            if (!isSame(validItems, originalLocalCart)) {
              set({ localCart: validItems, ...computeTotals(validItems) });

              const removedOutOfStock = originalLocalCart.length - validItems.length;
              if (showToast && removedOutOfStock > 0) {
                console.log(`${removedOutOfStock} item(s) removed due to out of stock`);
              }

              return true;
            }

            return validItems.some((item) => item.hasUpdates) || false;
          } catch (error) {
            console.log("Error refreshing cart:", error);
            return false;
          } finally {
            set({ isLoading: false });
          }
        } else if (userId) {
          await get().fetchCart();
          return false;
        }
        return false;
      },

      proceedToCheckout: (userId) => {
        if (!userId) {
          showError("Please log in to checkout");
          router.push("/account");
          return false;
        }

        router.push("/checkout" as never);
        return true;
      },

      getActiveCartItems: (userId) => (userId ? get().cartItems : get().localCart),

      getCartSummary: () => {
        const { totalItems, totalAmount, isLoading } = get();
        return { totalItems, totalAmount, isLoading };
      },

      startRefreshInterval: (userId) => {
        if (userId) return;

        const existing = get()._intervalId;
        if (existing) clearInterval(existing);

        const intervalId = setInterval(() => {
          if (get().localCart.length > 0) {
            get().refreshCart(null, true);
          }
        }, 30 * 60 * 1000);

        set({ _intervalId: intervalId });
      },

      stopRefreshInterval: () => {
        const id = get()._intervalId;
        if (id) {
          clearInterval(id);
          set({ _intervalId: null });
        }
      },

      onSessionChange: async (userId) => {
        const version = ++sessionVersion;
        set({ hasSynced: false });
        await waitForHydration();
        if (version !== sessionVersion) return;

        if (!userId) {
          set({ _lastUserId: null });
          await get().loadGuestCart();
          if (version !== sessionVersion) return;
          get().startRefreshInterval(null);
          return;
        }

        get().stopRefreshInterval();

        if (get()._lastUserId !== userId) {
          set({ _lastUserId: userId });
          await get().transferGuestCartToUserCart(userId);
          if (version !== sessionVersion) return;
        }

        await get().fetchCart();
      },
    }),
    {
      name: "evertale-cart",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        localCart: state.localCart,
        cartItems: state.cartItems,
        totalItems: state.totalItems,
        totalAmount: state.totalAmount,
        _lastUserId: state._lastUserId,
      }),
    }
  )
);

function waitForHydration() {
  return new Promise<void>((resolve) => {
    if (useCartStore.persist.hasHydrated()) {
      resolve();
      return;
    }
    const unsubscribe = useCartStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}