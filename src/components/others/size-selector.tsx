import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { CartLineItem } from "@/types/cart";

interface SizeSelectorProps {
  item: CartLineItem;
}

const SizeSelector = ({ item }: SizeSelectorProps) => {
  const userId = useAuthStore((s) => s.user?._id ?? null);
  const changeSize = useCartStore((s) => s.changeSize);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async (newSize: string) => {
    if (isLoading || newSize === item.productSize) return;
    setIsLoading(true);
    try {
      await changeSize(
        item.productId,
        item.productSize,
        newSize,
        item.quantity,
        userId
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.row, isLoading && styles.rowLoading]}>
      {item.availableSizes.map((size) => {
        const isSelected = size.name === item.productSize;
        const isOOS = size.stockQuantity <= 0;

        return (
          <Pressable
            key={size.name}
            onPress={() => handleSelect(size.name)}
            disabled={isOOS || isLoading}
            style={[
              styles.chip,
              isSelected && styles.chipSelected,
              isOOS && styles.chipOOS,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                isSelected && styles.chipTextSelected,
                isOOS && styles.chipTextOOS,
              ]}
            >
              {size.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  rowLoading: {
    opacity: 0.6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  chipSelected: {
    borderColor: "#1C1917",
    borderWidth: 2,
  },
  chipOOS: {
    borderColor: "#F5F5F4",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#78716C",
  },
  chipTextSelected: {
    color: "#1C1917",
  },
  chipTextOOS: {
    color: "#E7E5E4",
    textDecorationLine: "line-through",
  },
});

export default SizeSelector;