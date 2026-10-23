import { ShoppingBag } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import Toast from "react-native-toast-message";

import { useCartStore } from "@/store/cart-store";

interface BuyAgainButtonProps {
  order: any;
}

export default function BuyAgainButton({ order }: BuyAgainButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const cartItems = useCartStore((s: any) => s.items) as any[];
  const addToCart = useCartStore((s: any) => s.addToCart) as (
    product: any,
    size: string,
    quantity: number
  ) => Promise<void> | void;

  const handleBuyAgain = async () => {
    if (!order?.orderProducts?.length) {
      Toast.show({ type: "error", text1: "No products found" });
      return;
    }

    setIsProcessing(true);
    let addedItems = 0;
    let skippedItems = 0;

    try {
      for (const orderProduct of order.orderProducts) {
        if (!(orderProduct.currentStock > 0)) {
          skippedItems++;
          continue;
        }

        const existing = (cartItems || []).find(
          (item) =>
            item.productId === orderProduct.productId &&
            item.productSize === orderProduct.size
        );

        const availableSpace = existing
          ? orderProduct.currentStock - existing.quantity
          : orderProduct.currentStock;
        const quantityToAdd = Math.min(orderProduct.quantity, availableSpace);

        if (quantityToAdd <= 0) {
          skippedItems++;
          continue;
        }

        const productForCart = {
          _id: orderProduct.productId,
          title: orderProduct.title,
          featured_image: orderProduct.imageUrl,
          price: orderProduct.price,
          handle: orderProduct.handle,
          sizes: [
            { name: orderProduct.size, stockQuantity: orderProduct.currentStock },
          ],
          subCategory: orderProduct.subCategory,
          originalPrice: orderProduct.originalPrice,
          compareAtPrice: orderProduct.compareAtPrice,
          discounted_price: orderProduct.discounted_price || orderProduct.price,
        };

        try {
          await addToCart(productForCart, orderProduct.size, quantityToAdd);
          addedItems += quantityToAdd;
          if (quantityToAdd < orderProduct.quantity) skippedItems++;
        } catch {
          skippedItems++;
        }
      }

      if (addedItems > 0) {
        Toast.show({
          type: "success",
          text1: `${addedItems} item${addedItems > 1 ? "s" : ""} added to your cart`,
          text2:
            skippedItems > 0
              ? `${skippedItems} item${skippedItems > 1 ? "s" : ""} skipped or partly added`
              : `From order #${order?.orderId}`,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "No items added",
          text2: skippedItems > 0 ? "Items are out of stock" : undefined,
        });
      }
    } catch {
      Toast.show({ type: "error", text1: "Failed to add items" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Pressable
      style={[styles.btn, isProcessing && styles.disabled]}
      onPress={handleBuyAgain}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <ActivityIndicator size="small" color="#FFFAF5" />
      ) : (
        <ShoppingBag size={16} color="#FFFAF5" />
      )}
      <Text style={styles.text}>{isProcessing ? "Adding..." : "Buy again"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 36,
    backgroundColor: "#AE7857",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabled: { opacity: 0.7 },
  text: { color: "#FFFAF5", fontSize: 13, fontWeight: "500" },
});