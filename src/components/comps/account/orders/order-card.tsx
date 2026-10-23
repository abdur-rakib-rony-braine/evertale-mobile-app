import { ExternalLink, Package } from "lucide-react-native";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { formatCurrency } from "@/lib/format";
import AddressDialog from "./address-dialog";
import OrderActions from "./order-actions";
import { formatOrderDate, getStatusLabel, getTrackingUrl } from "./order-utils";
import ProductImages from "./product-images";

interface OrderCardProps {
  order: any;
  onPress?: (order: any) => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  if (!order) return null;

  const {
    orderId,
    createdAt,
    total,
    orderProducts = [],
    shippingAddress,
    trackingInfo,
  } = order;

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() => onPress?.(order)}
        disabled={!onPress}
      >
        <View style={styles.topBar}>
          <View style={styles.pill}>
            <Text style={styles.pillText} numberOfLines={1}>
              {getStatusLabel(order)}
            </Text>
          </View>
          <Text style={styles.date}>{formatOrderDate(createdAt)}</Text>
        </View>

        <ProductImages products={orderProducts} />

        <View style={styles.details}>
          <View style={styles.row}>
            <View style={styles.itemsGroup}>
              <Package size={14} color="#A8A29E" strokeWidth={1.8} />
              <Text style={styles.itemsText}>
                {orderProducts.length} {orderProducts.length === 1 ? "item" : "items"}
              </Text>
            </View>
            <Text style={styles.total}>{formatCurrency(total)}</Text>
          </View>

          <View style={styles.orderIdBox}>
            <Text style={styles.orderIdText}>
              <Text style={styles.orderIdLabel}>Order # </Text>
              {orderId}
            </Text>
          </View>

          {trackingInfo?.trackingNumber ? (
            <View style={styles.trackingBox}>
              <View style={styles.trackingLeft}>
                <View style={styles.dot} />
                <Text style={styles.trackingCarrier}>
                  {trackingInfo.carrier || "Australia Post"}
                </Text>
              </View>
              <Pressable
                style={styles.trackingLink}
                hitSlop={6}
                onPress={() =>
                  Linking.openURL(
                    getTrackingUrl(trackingInfo.carrier, trackingInfo.trackingNumber)
                  )
                }
              >
                <Text style={styles.trackingNumber}>{trackingInfo.trackingNumber}</Text>
                <ExternalLink size={12} color="#15803D" />
              </Pressable>
            </View>
          ) : null}

          {shippingAddress ? <AddressDialog address={shippingAddress} /> : null}
        </View>
      </Pressable>

      <OrderActions order={order} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F5F5F4",
    overflow: "hidden",
  },
  pressed: { borderColor: "#D6D3D1" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FAFAF9",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
    gap: 8,
  },
  pill: {
    flexShrink: 1,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    color: "#57534E",
    textTransform: "uppercase",
  },
  date: { fontSize: 12, color: "#A8A29E" },
  details: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemsGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
  itemsText: { fontSize: 12, color: "#78716C" },
  total: { fontSize: 14, fontWeight: "600", color: "#292524" },
  orderIdBox: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FAFAF9",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  orderIdText: { fontSize: 12, color: "#78716C" },
  orderIdLabel: { fontWeight: "600", color: "#44403C" },
  trackingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trackingLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" },
  trackingCarrier: { fontSize: 12, fontWeight: "500", color: "#15803D" },
  trackingLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  trackingNumber: { fontSize: 12, fontWeight: "500", color: "#15803D" },
});