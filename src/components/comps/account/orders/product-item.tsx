import { Image, StyleSheet, Text, View } from "react-native";

import { formatCurrency } from "@/lib/format";

interface ProductItemProps {
  item: any;
}

export default function ProductItem({ item }: ProductItemProps) {
  if (!item) return null;

  const hasComparePrice = parseFloat(item?.compareAtPrice) > 0 && item?.quantity > 0;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.imageBox}>
          {item?.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : null}
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item?.title}
          </Text>

          <View style={styles.detailsRow}>
            <Text style={styles.detailText}>Qty: {item?.quantity}</Text>
            <Text style={styles.detailText}>Size: {item?.productSize}</Text>
            <Text style={styles.detailText}>
              Price: {formatCurrency(item?.price)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.right}>
        {hasComparePrice && (
          <Text style={styles.comparePrice}>
            {formatCurrency(item?.compareAtPrice * item?.quantity)}
          </Text>
        )}

        <Text style={styles.price}>
          {formatCurrency(item?.price * item?.quantity)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FAFAF9",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#292524",
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detailText: {
    fontSize: 12,
    color: "#78716C",
  },
  right: {
    alignItems: "flex-end",
    marginLeft: 12,
    paddingTop: 2,
  },
  comparePrice: {
    fontSize: 13,
    color: "#A8A29E",
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: "600",
    color: "#292524",
  },
});