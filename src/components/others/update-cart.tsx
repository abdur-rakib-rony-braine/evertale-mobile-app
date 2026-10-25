import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Minus, Plus, Trash2 } from "lucide-react-native";

import { CartItem, useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";

interface UpdateCartProps {
  data: CartItem;
  onUpdate?: () => unknown | Promise<unknown>;
}

type LoadingAction = "increment" | "decrement" | "remove" | null;

const UpdateCart = ({ data, onUpdate }: UpdateCartProps) => {
  const userId = useAuthStore((s) => s.user?._id ?? null);

  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  const [stockQuantityError, setStockQuantityError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  const stockChecking = (value: "increment" | "decrement") => {
    const sizeInfo = data.availableSizes?.find(
      (size) => size.name === data.productSize
    );

    if (value === "decrement") {
      if (sizeInfo && sizeInfo.stockQuantity >= data.quantity - 1) {
        setStockQuantityError("");
        return true;
      }
    } else {
      if (sizeInfo && sizeInfo.stockQuantity > data.quantity) {
        setStockQuantityError("");
        return true;
      } else {
        setStockQuantityError("Stock limited!");
        return false;
      }
    }
    return true;
  };

  const handleQuantityChange = async (action: "increment" | "decrement") => {
    const canUpdate = stockChecking(action);
    if (!canUpdate) return;

    try {
      setIsLoading(true);
      setLoadingAction(action);

      const newQuantity =
        action === "increment" ? data.quantity + 1 : data.quantity - 1;

      if (newQuantity > 0) {
        await updateQuantity(
          data.productId,
          data.productSize,
          newQuantity,
          userId
        );
        if (onUpdate) await onUpdate();
      }
    } catch (error) {
      console.log("Error updating quantity:", error);
      setStockQuantityError("Failed to update quantity");
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleRemove = async () => {
    try {
      setIsLoading(true);
      setLoadingAction("remove");

      await removeFromCart(data.productId, data.productSize, userId);
      if (onUpdate) await onUpdate();
    } catch (error) {
      console.log("Error removing item from cart:", error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const isDecrementDisabled = isLoading || data.quantity <= 1;

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.errorText}>{stockQuantityError}</Text>

        <View style={styles.stepper}>
          <Pressable
            onPress={() => handleQuantityChange("decrement")}
            disabled={isDecrementDisabled}
            style={[
              styles.stepperButton,
              isDecrementDisabled && styles.stepperButtonDisabled,
            ]}
          >
            {isLoading && loadingAction === "decrement" ? (
              <ActivityIndicator size="small" color="#1c1917" />
            ) : (
              <Minus size={14} color="#1c1917" />
            )}
          </Pressable>

          <View style={styles.quantityBox}>
            <Text style={styles.quantityText}>{data?.quantity}</Text>
          </View>

          <Pressable
            onPress={() => handleQuantityChange("increment")}
            disabled={isLoading}
            style={[
              styles.stepperButton,
              isLoading && styles.stepperButtonDisabled,
            ]}
          >
            {isLoading && loadingAction === "increment" ? (
              <ActivityIndicator size="small" color="#1c1917" />
            ) : (
              <Plus size={14} color="#1c1917" />
            )}
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={handleRemove}
        disabled={isLoading}
        style={[styles.removeButton, isLoading && styles.removeButtonDisabled]}
        accessibilityLabel="Remove from cart"
      >
        {isLoading && loadingAction === "remove" ? (
          <ActivityIndicator size="small" color="#dc2626" />
        ) : (
          <Trash2 size={14} color="#1c1917" />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    minHeight: 20,
    paddingBottom: 4,
    fontSize: 12,
    color: "#DC2626",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9D9D9",
  },
  stepperButton: {
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  stepperButtonDisabled: {
    opacity: 0.5,
  },
  quantityBox: {
    height: 32,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#D1D5DB",
  },
  quantityText: {
    fontSize: 14,
    color: "#1C1917",
  },
  removeButton: {
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  removeButtonDisabled: {
    opacity: 0.5,
  },
});

export default UpdateCart;