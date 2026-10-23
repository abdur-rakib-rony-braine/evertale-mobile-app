import { ExternalLink, Package } from "lucide-react-native";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { formatCurrency } from "@/lib/format";
import AddressDialog from "./address-dialog";
import OrderActions from "./order-actions";
import { formatOrderDate, getTrackingUrl } from "./order-utils";
import ProductImages from "./product-images";
import OrderStatus from "./order-status";

interface OrderCardProps {
  order: any;
  onPress?: (order: any) => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const router = useRouter();

  if (!order) return null;

  const {
    _id,
    orderId,
    createdAt,
    total,
    orderProducts = [],
    shippingAddress,
    trackingInfo,
  } = order;

  // Get the dynamic status label (handles returns/exchanges)
  const statusLabel =
    order.returns?.length > 0
      ? `Return: ${order.returns[0].status}`
      : order.exchanges?.length > 0
      ? `Exchange: ${order.exchanges[0].status}`
      : order.orderStatus;

  const handlePress = () => {
    if (onPress) {
      onPress(order);
    } else {
      router.push(`/order/${_id}` as never);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={handlePress}
      >
        <View style={styles.topBar}>
          {/* REPLACED THE TEXT PILL WITH THE NEW COMPONENT */}
          <OrderStatus status={statusLabel} />
          
          <Text style={styles.date}>{formatOrderDate(createdAt)}</Text>
        </View>

        <ProductImages products={orderProducts} />

        <View style={styles.details}>
          {/* ... rest of the details */}
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
            <Pressable
              style={styles.trackingBox}
              onPress={() =>
                Linking.openURL(
                  getTrackingUrl(trackingInfo.carrier, trackingInfo.trackingNumber)
                )
              }
            >
              <View style={styles.trackingLeft}>
                <View style={styles.dot} />
                <Text style={styles.trackingCarrier}>
                  {trackingInfo.carrier || "Australia Post"}
                </Text>
              </View>
              <View style={styles.trackingLink}>
                <Text style={styles.trackingNumber}>
                  {trackingInfo.trackingNumber}
                </Text>
                <ExternalLink size={12} color="#15803D" />
              </View>
            </Pressable>
          ) : null}

          {shippingAddress ? <AddressDialog address={shippingAddress} /> : null}
        </View>
      </Pressable>

      <OrderActions order={order} />
    </View>
  );
}

const styles = StyleSheet.create({
  // ... same styles as before, you can delete `pill` and `pillText` styles
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
  date: { fontSize: 12, color: "#A8A29E" },
  details: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
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