import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Topbar from "@/components/comps/topbar";
import HeaderBar from "@/components/comps/header-bar";

export default function OrderFailed() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reason, sessionId } = useLocalSearchParams<{
    reason?: string;
    sessionId?: string;
  }>();

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
          <XCircle size={56} color="#DC2626" strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.subtitle}>
          We couldn't process your payment. Don't worry — no money was taken from
          your account.
        </Text>

        {reason ? (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>Reason</Text>
            <Text style={styles.reasonValue}>{decodeURIComponent(reason)}</Text>
          </View>
        ) : null}

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>What you can do</Text>
          <Text style={styles.helpItem}>• Check your card details and try again</Text>
          <Text style={styles.helpItem}>• Try a different payment method</Text>
          <Text style={styles.helpItem}>• Contact your bank if the issue persists</Text>
        </View>

        <Pressable
          onPress={() => router.replace("/checkout" as never)}
          style={styles.primaryBtn}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Try Again</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(tabs)/cart" as never)}
          style={styles.secondaryBtn}
        >
          <ArrowLeft size={16} color="#1C1917" />
          <Text style={styles.secondaryBtnText}>Back to Cart</Text>
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
    backgroundColor: "#FEF2F2",
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
    marginBottom: 24,
  },
  reasonBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
    padding: 16,
    marginBottom: 20,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#DC2626",
    marginBottom: 4,
  },
  reasonValue: {
    fontSize: 13,
    color: "#7F1D1D",
    lineHeight: 20,
  },
  helpBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FAFAF9",
    padding: 16,
    marginBottom: 32,
    gap: 8,
  },
  helpTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#57534E",
    marginBottom: 4,
  },
  helpItem: {
    fontSize: 13,
    color: "#78716C",
    lineHeight: 20,
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
    marginBottom: 12,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#1C1917",
    paddingHorizontal: 32,
    paddingVertical: 16,
    width: "100%",
    maxWidth: 320,
  },
  secondaryBtnText: {
    color: "#1C1917",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});