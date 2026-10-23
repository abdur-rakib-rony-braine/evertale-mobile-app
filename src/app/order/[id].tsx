import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Package } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiClient } from "@/lib/api/client";
import ProductItem from "@/components/comps/account/orders/product-item";
import ReturnDetails from "@/components/comps/account/orders/return-details";
import ExchangeDetails from "@/components/comps/account/orders/exchange-details";
import RefundDetails from "@/components/comps/account/orders/refund-details";
import OrderSummary from "@/components/comps/account/orders/order-summary";
import CustomerInfo from "@/components/comps/account/orders/customer-info";
import ShippingInfo from "@/components/comps/account/orders/shipping-info";

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      try {
        const res = await apiClient.get("/api/mobile-orders");
        
        if (res.data?.success) {
          const order = res.data.orders.find((o: any) => o._id === id);
          if (order) {
            if (!cancelled) setOrderData(order);
          } else {
            if (!cancelled) setError("Order not found");
          }
        } else {
          if (!cancelled) setError("Failed to load order");
        }
      } catch (err) {
        if (!cancelled) setError("Network error. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    if (id) fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#AE7857" />
      </SafeAreaView>
    );
  }

  if (error || !orderData) {
    return (
      <SafeAreaView style={styles.center}>
        <Package size={40} color="#D6D3D1" />
        <Text style={styles.errorText}>{error || "Order not found"}</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>GO BACK</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const {
    orderId,
    createdAt,
    orderProducts = [],
    returns = [],
    exchanges = [],
    refunds = [],
    shippingAddress,
    billingAddress,
    orderStatus,
    paymentStatus,
  } = orderData;

  const hasReturnsOrExchanges =
    returns.length > 0 || exchanges.length > 0 || refunds.length > 0;

  const formattedDate = new Date(createdAt).toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <ArrowLeft size={16} color="#78716C" />
          <Text style={styles.backText}>Back to Orders</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>ORDER DETAILS</Text>
          <Text style={styles.orderId}>Order #{orderId}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>

          <View style={styles.badgeRow}>
            {orderStatus && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{orderStatus}</Text>
              </View>
            )}
            {paymentStatus && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Payment: {paymentStatus}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            ORDER ITEMS ({orderProducts.length})
          </Text>
          <View style={styles.productList}>
            {orderProducts.map((item: any, idx: number) => (
              <ProductItem key={idx} item={item} />
            ))}
          </View>
        </View>

        {hasReturnsOrExchanges && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>RETURNS & EXCHANGES</Text>

            {returns.length > 0 && (
              <View style={styles.subSection}>
                {returns.map((r: any, idx: number) => (
                  <ReturnDetails key={`return-${idx}`} returnData={r} />
                ))}
              </View>
            )}

            {exchanges.length > 0 && (
              <View style={styles.subSection}>
                {exchanges.map((e: any, idx: number) => (
                  <ExchangeDetails key={`exchange-${idx}`} exchangeData={e} />
                ))}
              </View>
            )}

            {refunds.length > 0 && (
              <View style={styles.subSection}>
                {refunds.map((r: any, idx: number) => (
                  <RefundDetails key={`refund-${idx}`} refundData={r} />
                ))}
              </View>
            )}
          </View>
        )}

        <OrderSummary orderData={orderData} />

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>CUSTOMER INFORMATION</Text>
          <CustomerInfo customer={orderData.customer} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>SHIPPING & DELIVERY</Text>
          <ShippingInfo orderData={orderData} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>ADDRESSES</Text>
          
          <View style={styles.addressGroup}>
            <Text style={styles.addressTitle}>Shipping Address</Text>
            <View style={styles.addressTextContainer}>
              <Text style={styles.addressName}>
                {shippingAddress?.firstName} {shippingAddress?.lastName}
              </Text>
              <Text style={styles.addressLine}>{shippingAddress?.address}</Text>
              {shippingAddress?.address2 && (
                <Text style={styles.addressLine}>{shippingAddress.address2}</Text>
              )}
              <Text style={styles.addressLine}>
                {shippingAddress?.suburb}, {shippingAddress?.state}{" "}
                {shippingAddress?.postcode}
              </Text>
              <Text style={styles.addressLine}>{shippingAddress?.country}</Text>
              <Text style={styles.addressPhone}>{shippingAddress?.phone}</Text>
            </View>
          </View>

          {billingAddress && (
            <View style={styles.addressGroup}>
              <Text style={styles.addressTitle}>Billing Address</Text>
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressName}>
                  {billingAddress?.firstName} {billingAddress?.lastName}
                </Text>
                <Text style={styles.addressLine}>{billingAddress?.address}</Text>
                {billingAddress?.address2 && (
                  <Text style={styles.addressLine}>{billingAddress.address2}</Text>
                )}
                <Text style={styles.addressLine}>
                  {billingAddress?.suburb}, {billingAddress?.state}{" "}
                  {billingAddress?.postcode}
                </Text>
                <Text style={styles.addressLine}>{billingAddress?.country}</Text>
                <Text style={styles.addressPhone}>{billingAddress?.phone}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF9",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAF9",
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#78716C",
  },
  backBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#AE7857",
  },
  backBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    fontSize: 14,
    color: "#78716C",
    fontWeight: "500",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#A8A29E",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "600",
    color: "#292524",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: "#78716C",
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#FAFAF9",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#44403C",
    textTransform: "capitalize",
  },
  productList: {
    gap: 12,
  },
  subSection: {
    marginBottom: 16,
  },
  addressGroup: {
    marginBottom: 16,
  },
  addressTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#292524",
    marginBottom: 6,
  },
  addressTextContainer: {
    gap: 2,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#44403C",
  },
  addressLine: {
    fontSize: 14,
    color: "#78716C",
  },
  addressPhone: {
    fontSize: 14,
    color: "#78716C",
    marginTop: 4,
  },
});