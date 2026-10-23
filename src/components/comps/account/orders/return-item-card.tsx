import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";

interface ReturnItemCardProps {
  product: any;
  selected: boolean;
  onToggle: () => void;
}

export default function ReturnItemCard({ product, selected, onToggle }: ReturnItemCardProps) {
  const {
    productId,
    size,
    imageUrl,
    title,
    quantity,
    price,
    returnStatus,
    refundStatus,
    exchangeStatus,
  } = product;

  const isDisabled = returnStatus !== "None";

  const currentStatus =
    returnStatus !== "None"
      ? `Return: ${returnStatus}`
      : refundStatus !== "None"
      ? `Refund: ${refundStatus}`
      : exchangeStatus !== "None"
      ? `Exchange: ${exchangeStatus}`
      : null;

  const handleToggle = () => {
    if (!isDisabled) onToggle();
  };

  return (
    <View style={styles.wrapper}>
      {isDisabled && currentStatus && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{currentStatus}</Text>
        </View>
      )}

      <Pressable
        onPress={handleToggle}
        disabled={isDisabled}
        style={[
          styles.container,
          selected && styles.containerSelected,
          isDisabled && styles.containerDisabled,
        ]}
      >
        <View style={styles.checkboxWrapper}>
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
          </View>
        </View>

        {imageUrl && (
          <View style={styles.imageBox}>
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.meta}>
            Size: {size} | Qty: {quantity}
          </Text>
          <Text style={styles.price}>${price}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    marginBottom: 12,
  },
  statusBadge: {
    position: "absolute",
    right: 8,
    top: 8,
    zIndex: 10,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#B91C1C",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  containerSelected: {
    borderColor: "#78716C",
    backgroundColor: "#F5F5F4",
  },
  containerDisabled: {
    opacity: 0.5,
  },
  checkboxWrapper: {
    padding: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#D6D3D1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxSelected: {
    backgroundColor: "#AE7857",
    borderColor: "#AE7857",
  },
  imageBox: {
    width: 64,
    height: 64,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#F5F5F4",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#292524",
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: "#78716C",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
  },
});