import { Pressable, StyleSheet, Text, View } from "react-native";
import { AlertCircle, CheckCircle, X } from "lucide-react-native";

import { CartLineItem } from "@/types/cart";
import { formatCurrency } from "@/lib/format";

interface PriceUpdateAlertProps {
  item: CartLineItem;
  onDismiss?: (productId: string, productSize: string) => void;
}

const PriceUpdateAlert = ({ item, onDismiss }: PriceUpdateAlertProps) => {
  if (!item.priceChanged && !item.titleChanged) return null;

  return (
    <View style={styles.container}>
      {item.priceChanged ? (
        <AlertCircle size={16} color="#AE7857" style={styles.icon} />
      ) : (
        <CheckCircle size={16} color="#AE7857" style={styles.icon} />
      )}

      <View style={styles.content}>
        <Text style={styles.heading}>
          {item.priceChanged ? "Price Update" : "Product Updated"}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        {item.priceChanged ? (
          <View style={styles.priceRow}>
            <Text style={styles.oldPrice}>
              {formatCurrency(item.oldPrice ?? 0)}
            </Text>
            <Text style={styles.newPrice}>
              {formatCurrency(item.newPrice ?? item.price)}
            </Text>
          </View>
        ) : null}
      </View>

      {onDismiss ? (
        <Pressable
          onPress={() => onDismiss(item.productId, item.productSize)}
          hitSlop={8}
          accessibilityLabel="Dismiss"
        >
          <X size={14} color="#78716C" />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E8DDD3",
    borderRadius: 8,
    backgroundColor: "#F2EFE9",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  icon: {
    marginTop: 2,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  heading: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2B2520",
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    color: "#78716C",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  oldPrice: {
    fontSize: 12,
    color: "#9A9187",
    textDecorationLine: "line-through",
  },
  newPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#AE7857",
  },
});

export default PriceUpdateAlert;