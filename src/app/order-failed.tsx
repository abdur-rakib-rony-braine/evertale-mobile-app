import HeaderBar from "@/components/comps/header-bar";
import Topbar from "@/components/comps/topbar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertTriangle, CreditCard, ShoppingBag, X } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const STEPS = [
  "Your cart items have been saved and will be waiting for you",
  "You can try again with the same payment method or use a different one",
  "If you continue to experience issues, please contact customer support",
];

const safeDecode = (value?: string) => {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export default function OrderFailed() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reason } = useLocalSearchParams<{
    reason?: string;
    sessionId?: string;
  }>();

  const reasonText = safeDecode(reason);

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
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <X size={24} color="#DC2626" />
            </View>
            <Text style={styles.title}>Payment Declined</Text>
            <Text style={styles.subtitle}>Your payment could not be processed</Text>
          </View>

          <View style={styles.alert}>
            <AlertTriangle size={16} color="#DC2626" style={styles.alertIcon} />
            <View style={styles.alertBody}>
              <Text style={styles.alertTitle}>Payment Failed</Text>
              <Text style={styles.alertText}>
                Your transaction was declined. No charges have been made to your
                account.
              </Text>
              {reasonText ? (
                <Text style={styles.alertReason}>{reasonText}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.steps}>
            <Text style={styles.stepsTitle}>What happens next?</Text>
            {STEPS.map((text, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Pressable
              onPress={() => router.push("/checkout" as never)}
              style={styles.outlineBtn}
            >
              <CreditCard size={16} color="#1C1917" />
              <Text style={styles.outlineBtnText}>Try Again</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(tabs)" as never)}
              style={styles.primaryBtn}
            >
              <ShoppingBag size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Continue Shopping</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    padding: 16,
    paddingTop: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    gap: 8,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  alert: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginHorizontal: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  alertIcon: {
    marginTop: 2,
  },
  alertBody: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#DC2626",
  },
  alertText: {
    fontSize: 12,
    color: "#DC2626",
    lineHeight: 18,
  },
  alertReason: {
    fontSize: 12,
    color: "#7F1D1D",
    lineHeight: 18,
    marginTop: 4,
  },
  steps: {
    marginTop: 24,
    marginHorizontal: 24,
    gap: 12,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 24,
  },
  outlineBtn: {
    flex: 1,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C1917",
  },
  primaryBtn: {
    flex: 1,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#AE7857",
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});