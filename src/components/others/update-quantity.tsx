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
          style={[
            styles.stepperButton,
            styles.decrementButton,
            isDecrementDisabled && styles.disabled,
          ]}
        >
          {isLoading && loadingAction === "decrement" ? (
            <ActivityIndicator size="small" color="#78716c" />
          ) : (
            <Minus size={12} color="#78716c" />
          )}
        </Pressable>

        <View style={styles.quantityBox}>
          <Text style={styles.quantityText}>{data.quantity}</Text>
        </View>

        <Pressable
          onPress={() => handleQuantityChange("increment")}
          disabled={isLoading}
          style={[
            styles.stepperButton,
            styles.incrementButton,
            isLoading && styles.disabled,
          ]}
        >
          {isLoading && loadingAction === "increment" ? (
            <ActivityIndicator size="small" color="#78716c" />
          ) : (
            <Plus size={12} color="#78716c" />
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    fontSize: 12,
    color: "#F87171",
    marginBottom: 6,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  stepperButton: {
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  decrementButton: {
    borderRightWidth: 1,
    borderRightColor: "#E7E5E4",
  },
  incrementButton: {
    borderLeftWidth: 1,
    borderLeftColor: "#E7E5E4",
  },
  disabled: {
    opacity: 0.4,
  },
  quantityBox: {
    height: 28,
    minWidth: 32,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#292524",
  },
});

export default UpdateQuantity;