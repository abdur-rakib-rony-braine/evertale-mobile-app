import { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import {
  CheckCircle,
  Circle,
  CreditCard,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCheckoutStore } from "@/store/checkout-store";
import { useCartStore } from "@/store/cart-store";
import { useCheckoutStepStore } from "@/store/checkout-step-store";
import { useDiscountStore } from "@/store/discount-store";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api/client";
import { urls } from "@/constants/url";

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", description: "Secure encrypted payment via ANZ" },
  { id: "afterpay", label: "Afterpay", description: "Pay in 4 interest-free instalments" },
];

export default function PaymentForm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?._id ?? null);

  const { cartItems, totalAmount, clearCart } = useCartStore();
  const { appliedDiscount, freeShipping } = useDiscountStore();
  const {
    shippingAddress,
    billingAddress,
    shipping,
    notes,
    deliveryInstructions,
    setOrderId,
    resetCheckout,
  } = useCheckoutStore();
  const { resetSteps } = useCheckoutStepStore();

  const [selected, setSelected] = useState("card");
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const finalTotal = useMemo(() => {
    let total = totalAmount;
    if (appliedDiscount > 0) total -= appliedDiscount;
    if (!freeShipping && shipping?.cost) total += shipping.cost;
    return Math.max(0, total);
  }, [totalAmount, appliedDiscount, freeShipping, shipping]);

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      Toast.show({ type: "error", text1: "Your cart is empty" });
      return;
    }
    if (!shippingAddress?.firstName) {
      Toast.show({ type: "error", text1: "Please complete your shipping address" });
      return;
    }

    setIsLoading(true);

    console.log('cool pay', {
        items: cartItems,
        shippingAddress,
        billingAddress,
        shippingMethod: shipping,
        total: finalTotal,
        discountApplied: appliedDiscount,
        notes,
        deliveryInstructions,
      })

    try {
      const { data } = await apiClient.post("/api/checkout/session", {
        items: cartItems,
        shippingAddress,
        billingAddress,
        shippingMethod: shipping,
        total: finalTotal,
        discountApplied: appliedDiscount,
        notes,
        deliveryInstructions,
      });

      const sessionId = data.sessionId;
      setOrderId(sessionId);

      const ticketRes = await apiClient.post("/api/auth/webview-ticket");
      const next = `/mobile-payment?sessionId=${sessionId}&method=${selected}`;
      const url = `${urls.api.base}/api/auth/webview-login?ticket=${encodeURIComponent(
        ticketRes.data.ticket
      )}&next=${encodeURIComponent(next)}`;

      setPaymentUrl(url);
      setShowWebView(true);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.error || error.message || "Failed to initiate payment",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebViewNavigation = (navState: any) => {
    const { url } = navState;

    if (url.includes("/mobile-payment/success")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      const orderId = urlParams.get("orderId");

      setShowWebView(false);
      setPaymentUrl(null);

      resetCheckout();
      resetSteps();
      clearCart(userId);

      router.replace(`/order-success?orderId=${orderId}` as never);
    }

    if (url.includes("/mobile-payment/failed")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      const reason = urlParams.get("reason") || "Payment failed or was cancelled";

      setShowWebView(false);
      setPaymentUrl(null);

      router.replace(
        `/order-failed?reason=${encodeURIComponent(reason)}` as never
      );
    }
  };

  const closeWebView = () => {
    setShowWebView(false);
    setPaymentUrl(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.stepText}>Step 4</Text>
        <Text style={styles.heading}>Payment</Text>
        <View style={styles.secureRow}>
          <ShieldCheck size={14} color="#22C55E" />
          <Text style={styles.secureText}>
            All transactions are secure and encrypted
          </Text>
        </View>
      </View>

      <View style={styles.methodsList}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selected === method.id;
          return (
            <Pressable
              key={method.id}
              onPress={() => setSelected(method.id)}
              style={[styles.methodRow, isSelected && styles.methodRowActive]}
            >
              <View style={styles.methodLeft}>
                {isSelected ? (
                  <CheckCircle size={18} color="#AE7857" strokeWidth={2} />
                ) : (
                  <Circle size={18} color="#D6D3D1" strokeWidth={1.5} />
                )}
                <View>
                  <Text
                    style={[
                      styles.methodLabel,
                      isSelected && styles.methodLabelActive,
                    ]}
                  >
                    {method.label}
                  </Text>
                  <Text style={styles.methodDesc}>{method.description}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={handlePayment}
        disabled={isLoading}
        style={[styles.payBtn, isLoading && { opacity: 0.7 }]}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            {selected === "card" && <CreditCard size={18} color="#FFFFFF" />}
            {selected === "afterpay" && <Zap size={18} color="#FFFFFF" />}
            <Text style={styles.payBtnText}>
              PAY ${finalTotal.toFixed(2)}
            </Text>
          </>
        )}
      </Pressable>

      <Modal
        visible={showWebView}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeWebView}
      >
        <View style={[styles.webviewContainer, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Secure Checkout</Text>
            <Pressable onPress={closeWebView} hitSlop={10} style={styles.closeBtn}>
              <X size={24} color="#78716C" />
            </Pressable>
          </View>

          {!paymentUrl ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#AE7857" />
              <Text style={styles.loadingText}>Initializing payment...</Text>
            </View>
          ) : (
            <WebView
              source={{ uri: paymentUrl }}
              onNavigationStateChange={handleWebViewNavigation}
              style={{ flex: 1 }}
              javaScriptEnabled
              domStorageEnabled
              thirdPartyCookiesEnabled
              sharedCookiesEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#AE7857" />
                  <Text style={styles.loadingText}>Loading secure payment...</Text>
                </View>
              )}
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2.16,
    textTransform: "uppercase",
    color: "#A8A29E",
    marginBottom: 4,
  },
  heading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#292524",
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  secureText: {
    fontSize: 12,
    color: "#A8A29E",
  },
  methodsList: {
    gap: 12,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  methodRowActive: {
    borderColor: "#AE7857",
    backgroundColor: "#FDF8F4",
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#57534E",
  },
  methodLabelActive: {
    color: "#1C1917",
  },
  methodDesc: {
    fontSize: 12,
    color: "#A8A29E",
    marginTop: 2,
  },
  payBtn: {
    height: 52,
    backgroundColor: "#AE7857",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#292524",
  },
  closeBtn: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#78716C",
  },
});