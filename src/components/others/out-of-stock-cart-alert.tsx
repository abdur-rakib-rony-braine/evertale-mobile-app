import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CartLineItem } from "@/types/cart";

interface OutOfStockCartAlertProps {
  unavailableItems: CartLineItem[];
  onClose?: () => void;
}

const OutOfStockCartAlert = ({
  unavailableItems,
  onClose,
}: OutOfStockCartAlertProps) => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Items Unavailable</Text>
          <Text style={styles.description}>
            Some items in your cart are out of stock or no longer available.
            Please remove them before checking out.
          </Text>

          <ScrollView style={styles.list}>
            {unavailableItems.map((item) => (
              <View
                key={`${item.productId}-${item.productSize}`}
                style={styles.itemRow}
              >
                <Image
                  source={{ uri: item.featured_image }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSize}>Size: {item.productSize}</Text>
                  <Text style={styles.itemError}>
                    {item.stockError ||
                      (typeof item.currentStock === "undefined" ||
                      item.currentStock === 0
                        ? "Out of stock"
                        : `Only ${item.currentStock} left`)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable onPress={handleClose} style={styles.okButton}>
            <Text style={styles.okButtonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1917",
  },
  description: {
    fontSize: 14,
    color: "#78716C",
    lineHeight: 20,
  },
  list: {
    maxHeight: 200,
    marginVertical: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
    marginBottom: 8,
  },
  itemImage: {
    height: 64,
    width: 48,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C1917",
  },
  itemSize: {
    fontSize: 12,
    color: "#4B5563",
  },
  itemError: {
    fontSize: 12,
    color: "#EF4444",
  },
  okButton: {
    backgroundColor: "#AE7857",
    paddingVertical: 12,
    alignItems: "center",
  },
  okButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default OutOfStockCartAlert;