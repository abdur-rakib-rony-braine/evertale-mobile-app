import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ArrowRightLeft, CheckCircle, Circle } from "lucide-react-native";
import Toast from "react-native-toast-message";

import { useExchangeStore } from "@/store/exchange-store";
import { apiClient } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";
import AnzPaymentButton from "@/components/comps/account/orders/anz-payment-button";
import { Image } from "expo-image";

export default function ExchangeCheckoutScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();

  const { newProducts, selectedProducts, currentOrder, reset } = useExchangeStore();

  const [reason, setReason] = useState("");
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any | null>(null);
  const [returnShippingMethod, setReturnShippingMethod] = useState<any | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await apiClient.get("/api/admin/shipping");
        if (res.data.success) {
          const methods = res.data.data;
          setShippingMethods(methods);
          
          const defaultMethod = methods.find((m: any) => m.isDefault) || methods[0];
          setSelectedShippingMethod(defaultMethod);
          setReturnShippingMethod(defaultMethod);
        }
      } catch {
        Toast.show({ type: "error", text1: "Failed to load shipping methods" });
      } finally {
        setIsFetching(false);
      }
    };
    fetchShipping();
  }, []);

  const newItemsTotal = newProducts.reduce(
    (total, p) => total + p.price * p.quantity,
    0
  );
  const oldItemsTotal = selectedProducts.reduce(
    (total, p) => total + p.price * p.quantity,
    0
  );
  
  const exchangeShipping = selectedShippingMethod?.cost || 0;
  const returnShippingCost = returnShippingMethod?.cost || 0;

  const totalNewCost = newItemsTotal + exchangeShipping + returnShippingCost;
  const priceDifference = totalNewCost - oldItemsTotal;
  const isCustomerPay = priceDifference > 0;
  const totalAmountToPay = Math.abs(priceDifference || 0);
  const isRefundAble = priceDifference < 0;

  const handleExchangeRequest = async () => {
    if (!selectedShippingMethod) {
      Toast.show({ type: "error", text1: "Please select a shipping method" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/api/exchange-request", {
        orderId: currentOrder?.orderId || orderId,
        oldProducts: selectedProducts,
        newProducts,
        reason: reason || "Product Exchange",
        amount: Math.abs(totalAmountToPay || 0),
        exchangeShippingMethod: selectedShippingMethod,
        returnShippingMethod: returnShippingMethod,
        isRefundAble: isRefundAble,
      });

      if (response.data.success) {
        Toast.show({ type: "success", text1: "Exchange Requested Successfully" });
        reset();
        router.replace("/account");
      } else {
        throw new Error(response.data.error || "Exchange failed");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.error || error.message || "Exchange failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#AE7857" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <ArrowLeft size={16} color="#78716C" />
          <Text style={styles.backText}>Back to Exchange</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Exchange Checkout</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Exchange Details</Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailsColumn}>
              <Text style={styles.detailsSub}>Previous Products</Text>
              {selectedProducts.map((p: any, i: number) => (
                <View key={i} style={styles.miniProduct}>
                  <Image source={{ uri: p.imageUrl }} style={styles.miniImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniTitle} numberOfLines={1}>{p.title}</Text>
                    <Text style={styles.miniMeta}>Size: {p.size}</Text>
                    <Text style={styles.miniPrice}>{formatCurrency(p.price)}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.arrowBox}>
              <ArrowRightLeft size={20} color="#2563EB" />
            </View>

            <View style={styles.detailsColumn}>
              <Text style={styles.detailsSub}>New Products</Text>
              {newProducts.map((p: any, i: number) => (
                <View key={i} style={styles.miniProduct}>
                  <Image source={{ uri: p.imageUrl }} style={styles.miniImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniTitle} numberOfLines={1}>{p.title}</Text>
                    <Text style={styles.miniMeta}>Size: {p.size}</Text>
                    <Text style={styles.miniPrice}>{formatCurrency(p.price)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reason</Text>
          <TextInput
            style={styles.textArea}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            placeholder="Tell us why you want to exchange these products..."
            placeholderTextColor="#A8A29E"
            textAlignVertical="top"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Exchange Shipping Method</Text>
          {shippingMethods.map((method) => {
            const isSelected = selectedShippingMethod?._id === method._id;
            return (
              <Pressable
                key={method._id}
                style={[styles.shippingCard, isSelected && styles.shippingCardSelected]}
                onPress={() => setSelectedShippingMethod(method)}
              >
                {isSelected ? (
                  <CheckCircle size={20} color="#AE7857" />
                ) : (
                  <Circle size={20} color="#A8A29E" />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.shipName, isSelected && { color: "#AE7857" }]}>
                    {method.name}
                  </Text>
                  <Text style={styles.shipDesc}>Est. delivery: {method.estimatedDelivery}</Text>
                </View>
                <Text style={[styles.shipPrice, isSelected && { color: "#AE7857" }]}>
                  {formatCurrency(method.cost)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>New Products</Text>
            <Text style={styles.summaryValue}>+ {formatCurrency(newItemsTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Return Shipping</Text>
            <Text style={styles.summaryValue}>+ {formatCurrency(returnShippingCost)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Exchange Shipping</Text>
            <Text style={styles.summaryValue}>+ {formatCurrency(exchangeShipping)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontWeight: "600" }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { fontWeight: "600" }]}>
              {formatCurrency(totalNewCost)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: "#16A34A" }]}>Return Credit</Text>
            <Text style={[styles.summaryValue, { color: "#16A34A" }]}>
              - {formatCurrency(oldItemsTotal)}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>
                {isCustomerPay && totalAmountToPay !== 0 && "Amount to Pay"}
                {!isCustomerPay && totalAmountToPay === 0 && "Amount"}
                {isRefundAble && "Refund Amount"}
              </Text>
            </View>
            <Text style={[styles.totalValue, { color: isCustomerPay ? "#2563EB" : "#16A34A" }]}>
              {isCustomerPay && totalAmountToPay > 0 ? "+" : ""}
              {formatCurrency(totalAmountToPay)}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          {isCustomerPay ? (
            selectedShippingMethod ? (
              <AnzPaymentButton
                orderId={(currentOrder?.orderId || orderId) as string}
                amount={totalAmountToPay}
                exchangeShippingMethod={selectedShippingMethod}
                returnShippingMethod={returnShippingMethod}
                reason={reason}
                selectedProducts={selectedProducts}
                newProducts={newProducts}
                isRefundAble={isRefundAble}
                onPaymentSuccess={() => {
                  reset();
                  router.replace("/account");
                }}
                onClose={() => {}}
              />
            ) : (
              <Pressable style={[styles.submitBtn, styles.disabledBtn]} disabled>
                <Text style={styles.submitBtnText}>PLEASE SELECT SHIPPING METHOD</Text>
              </Pressable>
            )
          ) : (
            <Pressable
              style={[styles.submitBtn, (isLoading || !selectedShippingMethod) && styles.disabledBtn]}
              disabled={isLoading || !selectedShippingMethod}
              onPress={handleExchangeRequest}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>REQUEST EXCHANGE</Text>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF9" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FAFAF9" },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  backText: { fontSize: 14, color: "#78716C", fontWeight: "500" },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 16 },
  title: { fontSize: 22, fontFamily: "Rexagus", textAlign: "center", marginBottom: 8, color: "#292524" },
  card: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#F5F5F4", padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#292524", marginBottom: 12 },
  detailsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailsColumn: { flex: 1, gap: 8 },
  detailsSub: { fontSize: 11, fontWeight: "600", color: "#78716C", marginBottom: 4 },
  miniProduct: { flexDirection: "row", gap: 8, backgroundColor: "#F5F5F4", padding: 8, borderRadius: 8 },
  miniImg: { width: 40, height: 40, borderRadius: 4 },
  miniTitle: { fontSize: 11, fontWeight: "500", color: "#292524" },
  miniMeta: { fontSize: 10, color: "#78716C" },
  miniPrice: { fontSize: 11, fontWeight: "600", color: "#292524" },
  arrowBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center" },
  textArea: { borderWidth: 1, borderColor: "#E7E5E4", padding: 12, minHeight: 80, fontSize: 14, color: "#292524" },
  shippingCard: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#E7E5E4", padding: 12, marginBottom: 8 },
  shippingCardSelected: { borderColor: "#AE7857", backgroundColor: "#FDF8F5" },
  shipName: { fontSize: 13, fontWeight: "500", color: "#292524" },
  shipDesc: { fontSize: 11, color: "#78716C" },
  shipPrice: { fontSize: 13, fontWeight: "600", color: "#292524" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: "#44403C" },
  summaryValue: { fontSize: 13, color: "#292524" },
  divider: { height: 1, backgroundColor: "#E7E5E4", marginVertical: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 15, fontWeight: "600", color: "#292524" },
  totalValue: { fontSize: 18, fontWeight: "700" },
  submitBtn: { height: 48, backgroundColor: "#AE7857", alignItems: "center", justifyContent: "center" },
  disabledBtn: { opacity: 0.5 },
  submitBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
});