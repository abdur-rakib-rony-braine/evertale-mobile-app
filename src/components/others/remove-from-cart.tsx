import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Trash2 } from "lucide-react-native";

import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { CartLineItem } from "@/types/cart";

interface RemoveFromCartProps {
  data: CartLineItem;
  onRemove?: () => unknown | Promise<unknown>;
}

const RemoveFromCart = ({ data, onRemove }: RemoveFromCartProps) => {
  const userId = useAuthStore((s) => s.user?._id ?? null);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const [isLoading, setIsLoading] = useState(false);

  const handleRemoveFromCart = async () => {
    try {
      setIsLoading(true);
      await removeFromCart(data.productId, data.productSize, userId);
      if (onRemove) await onRemove();
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handleRemoveFromCart}
      disabled={isLoading}
      accessibilityLabel="Remove from cart"
      hitSlop={6}
      style={[styles.button, isLoading && styles.buttonDisabled]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#DC2626" />
      ) : (
        <Trash2 size={15} color="#78716C" strokeWidth={1.8} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#F2EFE9",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default RemoveFromCart;