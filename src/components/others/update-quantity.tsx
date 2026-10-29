import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Minus, Plus } from "lucide-react-native";

import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { CartLineItem } from "@/types/cart";

interface UpdateQuantityProps {
  data: CartLineItem;
  onUpdate?: () => unknown | Promise<unknown>;
}

type Action = "increment" | "decrement";

const UpdateQuantity = ({ data, onUpdate }: UpdateQuantityProps) => {
  const userId = useAuthStore((s) => s.user?._id ?? null);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const [stockQuantityError, setStockQuantityError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<Action | null>(null);

  const stockChecking = (value: Action) => {
    const sizeInfo = data.availableSizes?.find(
      (size) => size.name === data.productSize
    );

    if (value === "decrement") {
      setStockQuantityError("");
      return true;
    }

    if (sizeInfo && sizeInfo.stockQuantity > data.quantity) {
      setStockQuantityError("");
      return true;
    }

    setStockQuantityError("Stock limit reached");
    return false;
  };

  const handleQuantityChange = async (value: Action) => {
    if (!stockChecking(value)) return;

    try {
      setIsLoading(true);
      setLoadingAction(value);

      const newQuantity =
        value === "increment" ? data.quantity + 1 : data.quantity - 1;

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
      setStockQuantityError(
        error instanceof Error && error.message
          ? error.message
          : "Failed to update"
      );
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const isDecrementDisabled = isLoading || data.quantity <= 1;

  return (
    <View>
      {stockQuantityError ? (
        <Text style={styles.errorText}>{stockQuantityError}</Text>
      ) : null}

      <View style={styles.stepper}>
        <Pressable
          onPress={() => handleQuantityChange("decrement")}
          disabled={isDecrementDisabled}
          hitSlop={4}
          accessibilityLabel="Decrease quantity"
          style={[styles.stepperButton, isDecrementDisabled && styles.disabled]}
        >
          {isLoading && loadingAction === "decrement" ? (
            <ActivityIndicator size="small" color="#AE7857" />
          ) : (
            <Minus size={13} color="#2B2520" strokeWidth={2} />
          )}
        </Pressable>

        <View style={styles.quantityBox}>
          <Text style={styles.quantityText}>{data.quantity}</Text>
        </View>

        <Pressable
          onPress={() => handleQuantityChange("increment")}
          disabled={isLoading}
          hitSlop={4}
          accessibilityLabel="Increase quantity"
          style={[styles.stepperButton, isLoading && styles.disabled]}
        >
          {isLoading && loadingAction === "increment" ? (
            <ActivityIndicator size="small" color="#AE7857" />
          ) : (
            <Plus size={13} color="#2B2520" strokeWidth={2} />
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#DC2626",
    marginBottom: 6,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    borderRadius: 4,
    overflow: "hidden",
  },
  stepperButton: {
    height: 32,
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.35,
  },
  quantityBox: {
    height: 32,
    minWidth: 34,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#F2EFE9",
    backgroundColor: "#FAFAF9",
  },
  quantityText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2B2520",
  },
});

export default UpdateQuantity;