import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { CheckCircle2, ShoppingBag } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Topbar from "@/components/comps/topbar";
import HeaderBar from "@/components/comps/header-bar";

export default function OrderSuccess() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  return (
    <SafeAreaView edges={["top"]} style={styles.scroll}>
      <Topbar />
      <HeaderBar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconCircle}>
          <CheckCircle2 size={56} color="#16A34A" strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Order Confirmed</Text>
        <Text style={styles.subtitle}>
          Thank you for your purchase! We've received your order and will send
          a confirmation email shortly.
        </Text>

        {orderId ? (
          <View style={styles.orderIdBox}>
            <Text style={styles.orderIdLabel}>Order Number</Text>
            <Text style={styles.orderIdValue}>#{orderId}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => router.replace("/(tabs)" as never)}
          style={styles.primaryBtn}
        >
          <ShoppingBag size={16} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Continue Shopping</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C1917",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#78716C",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  orderIdBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FAFAF9",
    padding: 20,
    alignItems: "center",
    marginBottom: 32,
  },
  orderIdLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#A8A29E",
    marginBottom: 6,
  },
  orderIdValue: {
    fontSize: 18,
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
    maxWidth: 320,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});