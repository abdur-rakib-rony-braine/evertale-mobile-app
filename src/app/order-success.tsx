import HeaderBar from "@/components/comps/header-bar";
import Topbar from "@/components/comps/topbar";
import { apiClient } from "@/lib/api/client";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertTriangle, CheckCircle2, ShoppingBag } from "lucide-react-native";
import { ReactNode, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const formatCurrency = (value?: number | null) =>
  `$${Number(value || 0).toFixed(2)}`;

const InfoBlock = ({ title, children }: { title: string; children: ReactNode }) => (
  <View style={styles.block}>
    <Text style={styles.blockTitle}>{title}</Text>
    <View style={styles.blockBody}>{children}</View>
  </View>
);

const Row = ({ label, value, valueStyle }: { label: string; value: string; valueStyle?: any }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
  </View>
);

const AddressBlock = ({ label, address }: { label: string; address?: any }) => (
  <View style={styles.addressBlock}>
    <Text style={styles.blockTitle}>{label}</Text>
    <Text style={styles.addressName}>
      {`${address?.firstName || ""} ${address?.lastName || ""}`.trim()}
    </Text>
    {address?.companyLabel ? (
      <Text style={styles.addressLine}>{address.companyLabel}</Text>
    ) : null}
    <Text style={styles.addressLine}>
      {address?.address}
      {address?.address2 ? `, ${address.address2}` : ""}
    </Text>
    <Text style={styles.addressLine}>
      {[address?.suburb, address?.state, address?.postcode].filter(Boolean).join(", ")}
    </Text>
    {address?.country ? <Text style={styles.addressLine}>{address.country}</Text> : null}
  </View>
);

export default function OrderSuccess() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        if (!orderId) throw new Error("Missing order ID");
        const { data } = await apiClient.get(`/api/orders/${orderId}`);
        if (!active) return;
        setOrder(data);
        setError(null);
      } catch (err: any) {
        if (!active) return;
        setError(
          err?.response?.data?.error || err?.message || "Failed to load order details"
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

  const goHome = () => router.replace("/(tabs)" as never);

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.screen}>
        <Topbar />
        <HeaderBar />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#AE7857" />
          <Text style={styles.centerText}>Fetching your order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView edges={["top"]} style={styles.screen}>
        <Topbar />
        <HeaderBar />
        <View style={styles.center}>
          <AlertTriangle size={40} color="#F87171" strokeWidth={1.5} />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.centerText}>
            {error || "The requested order could not be found."}
          </Text>
          <Pressable onPress={goHome} style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>Return to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <Topbar />
      <HeaderBar />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <CheckCircle2 size={32} color="#22C55E" strokeWidth={1.8} />
          </View>
          <Text style={styles.title}>Order Confirmed</Text>
          <Text style={styles.subtitle}>
            Thank you! Your order has been received and is being processed.
          </Text>
          <View style={styles.orderIdBox}>
            <Text style={styles.orderIdLabel}>Order</Text>
            <Text style={styles.orderIdValue}>{order.orderId}</Text>
          </View>
        </View>

        <InfoBlock title="Order Status">
          <Row label="Status" value="Approved" />
          <Row
            label="Payment"
            value={order.paymentStatus || "Pending"}
            valueStyle={styles.capitalize}
          />
          <Row
            label="Payment Method"
            value={order.paymentMethod || "-"}
            valueStyle={styles.capitalize}
          />
        </InfoBlock>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Addresses</Text>
          <View style={styles.addressStack}>
            <AddressBlock label="Shipping Address" address={order.shippingAddress} />
            <View style={styles.divider} />
            <AddressBlock label="Billing Address" address={order.billingAddress} />
          </View>
        </View>

        <InfoBlock title="Delivery">
          <Row label="Method" value={order.shipping?.method || "Standard Shipping"} />
          <Row label="Cost" value={formatCurrency(order.shipping?.cost)} />
          {order.deliveryInstructions ? (
            <Row label="Instructions" value={order.deliveryInstructions} />
          ) : null}
        </InfoBlock>

        <InfoBlock title="Contact">
          <Row
            label="Name"
            value={`${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim()}
          />
          <Row label="Email" value={order.shippingAddress?.email || "-"} />
          <Row label="Phone" value={order.shippingAddress?.phone || "-"} />
        </InfoBlock>

        {order.notes ? (
          <InfoBlock title="Order Notes">
            <Text style={styles.noteText}>{order.notes}</Text>
          </InfoBlock>
        ) : null}

        {order.orderProducts?.length > 0 && (
          <View style={styles.itemsSection}>
            <Text style={styles.blockTitle}>Items Ordered</Text>

            <View style={styles.itemsList}>
              {order.orderProducts.map((product: any, index: number) => (
                <View key={index} style={styles.itemCard}>
                  <Pressable
                    onPress={() =>
                      product?.handle
                        ? router.push(`/product/${product.handle}` as never)
                        : undefined
                    }
                    style={styles.itemImageWrap}
                  >
                    {product?.imageUrl ? (
                      <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    ) : null}
                  </Pressable>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{product?.title}</Text>
                    <Text style={styles.itemMeta}>
                      Size: {product?.size || "Standard"} · Qty: {product?.quantity}
                    </Text>
                    <Text style={styles.itemEach}>
                      {formatCurrency(product?.price)} each
                    </Text>
                    <Text style={styles.itemTotal}>
                      {formatCurrency((product?.price || 0) * (product?.quantity || 1))}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.block}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryLabel}>{formatCurrency(order.subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={styles.discountRed}>
                  -{formatCurrency(order.discountApplied)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.summaryLabel}>
                  {formatCurrency(order.shipping?.cost)}
                </Text>
              </View>
              {order.discount?.map((item: any, i: number) => (
                <View key={i} style={styles.summaryRow}>
                  <Text style={styles.discountGreen}>Discount ({item?.code})</Text>
                  <Text style={styles.discountGreen}>−{formatCurrency(item?.amount)}</Text>
                </View>
              ))}
              {order.gst > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>GST</Text>
                  <Text style={styles.summaryLabel}>{formatCurrency(order.gst)}</Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
              </View>
            </View>
          </View>
        )}

        <Pressable onPress={() => router.push("/(tabs)" as never)} style={styles.primaryBtn}>
          <ShoppingBag size={16} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Continue Shopping</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 24,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  centerText: {
    fontSize: 14,
    color: "#78716C",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#292524",
  },
  hero: {
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#292524",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#78716C",
    textAlign: "center",
    lineHeight: 20,
  },
  orderIdBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FAFAF9",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  orderIdLabel: {
    fontSize: 12,
    color: "#A8A29E",
    letterSpacing: 0.5,
  },
  orderIdValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#292524",
  },
  block: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 20,
    gap: 12,
  },
  blockTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2.16,
    textTransform: "uppercase",
    color: "#A8A29E",
  },
  blockBody: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingVertical: 2,
  },
  rowLabel: {
    fontSize: 14,
    color: "#78716C",
  },
  rowValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#292524",
    textAlign: "right",
  },
  capitalize: {
    textTransform: "capitalize",
  },
  addressStack: {
    gap: 16,
  },
  addressBlock: {
    gap: 4,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#44403C",
    marginTop: 4,
  },
  addressLine: {
    fontSize: 12,
    color: "#78716C",
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F4",
  },
  noteText: {
    fontSize: 14,
    color: "#57534E",
  },
  itemsSection: {
    gap: 12,
  },
  itemsList: {
    gap: 8,
  },
  itemCard: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "#FAF6F1",
    padding: 16,
  },
  itemImageWrap: {
    width: 64,
    height: 96,
    backgroundColor: "#F5F5F4",
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#292524",
  },
  itemMeta: {
    fontSize: 12,
    color: "#A8A29E",
  },
  itemEach: {
    fontSize: 12,
    color: "#78716C",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#78716C",
  },
  discountRed: {
    fontSize: 12,
    color: "#DC2626",
  },
  discountGreen: {
    fontSize: 12,
    color: "#16A34A",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#57534E",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1917",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1C1917",
    paddingHorizontal: 32,
    paddingVertical: 16,
    width: "100%",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  outlineBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#292524",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  outlineBtnText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#292524",
  },
});