import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import CartTable from "./cart-table";
import EmptyCart from "./empty-cart";
import CartSkeleton from "./cart-sekeleton";

const useCartHydrated = () => {
  const [hydrated, setHydrated] = useState(useCartStore.persist.hasHydrated());

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsubscribe = useCartStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    return unsubscribe;
  }, []);

  return hydrated;
};

const Cart = () => {
  const userId = useAuthStore((s) => s.user?._id ?? null);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const hydrated = useCartHydrated();
  const hasSynced = useCartStore((s) => s.hasSynced);
  const isLoading = useCartStore((s) => s.isLoading);
  const itemCount = useCartStore(
    (s) => (userId ? s.cartItems : s.localCart).length
  );

  if (!hydrated || !isInitialized) return <CartSkeleton />;
  if (itemCount === 0 && (!hasSynced || isLoading)) return <CartSkeleton />;

  return itemCount === 0 ? <EmptyCart /> : <CartTable />;
};

export default Cart;