import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useExchangeStore } from "@/store/exchange-store";
import ItemCard from "./item-card";

interface ExchangeContentProps {
  onClose: () => void;
}

export default function ExchangeContent({ onClose }: ExchangeContentProps) {
  const router = useRouter();
  
  const {
    currentOrder,
    getAvailableProducts,
    addSelectedProduct,
    removeSelectedProduct,
    selectedProducts,
    getRemainingExchanges,
    createExchangeData,
    isProductExchangeable,
  } = useExchangeStore();

  const availableItems = useMemo(() => getAvailableProducts(), [getAvailableProducts]);
  const remainingExchanges = getRemainingExchanges();

  const toggleItem = (product: any) => {
    const exists = selectedProducts.find(
      (p) => p.productId === product.productId && p.size === product.size
    );

    if (exists) {
      removeSelectedProduct(product.productId, product.size);
    } else {
      if (selectedProducts.length >= remainingExchanges) {
        Toast.show({
          type: "error",
          text1: `Maximum ${remainingExchanges} item(s) can be exchanged`,
        });
        return;
      }

      if (!isProductExchangeable(product)) {
        Toast.show({
          type: "error",
          text1: "This product is not exchangeable",
        });
        return;
      }

      addSelectedProduct(product);
    }
  };

  const handleConfirm = () => {
    if (selectedProducts.length === 0) {
      Toast.show({ type: "error", text1: "No items selected" });
      return;
    }

    if (selectedProducts.length > remainingExchanges) {
      Toast.show({
        type: "error",
        text1: `You can only exchange ${remainingExchanges} more item(s)`,
      });
      return;
    }

    const exchangeData = createExchangeData("Product Exchange");

    if (!exchangeData) {
      Toast.show({ type: "error", text1: "Exchange validation failed" });
      return;
    }

    Toast.show({ type: "success", text1: "Items saved for exchange" });
    
    onClose();
    router.push(`/exchange-order?orderId=${currentOrder.orderId}` as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        {availableItems.map((product: any) => (
          <ItemCard
            key={`${product.productId}-${product.size}`}
            product={product}
            selected={selectedProducts.some(
              (item) => item.productId === product.productId && item.size === product.size
            )}
            onToggle={() => toggleItem(product)}
          />
        ))}
      </View>

      {availableItems.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No items available for exchange</Text>
        </View>
      )}

      <View style={styles.policyCard}>
        <Text style={styles.policyTitle}>Exchange Policy</Text>
        <View style={styles.policyList}>
          <Text style={styles.policyText}>• Each product can be exchanged only once</Text>
          <Text style={styles.policyText}>• Replacement products cannot be exchanged</Text>
          <Text style={styles.policyText}>• Exchange period: 30 days from order date</Text>
          <Text style={styles.policyText}>• Items must be in original condition</Text>
        </View>
      </View>

      <Pressable
        style={[
          styles.confirmBtn,
          selectedProducts.length === 0 && styles.confirmBtnDisabled,
        ]}
        disabled={selectedProducts.length === 0}
        onPress={handleConfirm}
      >
        <Text style={styles.confirmBtnText}>CONFIRM & PROCEED</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  list: {
    gap: 4,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#78716C",
  },
  policyCard: {
    borderWidth: 1,
    borderColor: "#E7E5E4",
    padding: 16,
    backgroundColor: "#FAFAF9",
  },
  policyTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#292524",
    marginBottom: 8,
  },
  policyList: {
    gap: 4,
  },
  policyText: {
    fontSize: 12,
    color: "#78716C",
    lineHeight: 18,
  },
  confirmBtn: {
    height: 48,
    backgroundColor: "#AE7857",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
  },
});