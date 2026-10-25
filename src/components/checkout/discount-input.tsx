import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { CheckCircle, Loader2, Tag, X } from "lucide-react-native";
import { useDiscountStore } from "@/store/discount-store";

export default function DiscountInput({ cart, customerId = null }: any) {
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");
  const {
    discountData,
    appliedDiscount,
    freeShipping,
    isLoading,
    error,
    applyDiscount,
    removeDiscount,
    clearError,
  } = useDiscountStore();

  const handleApply = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setLocalError("Please enter a discount code");
      return;
    }

    setLocalError("");
    clearError();

    const result = await applyDiscount(cart, trimmedCode, customerId);

    if (result.success) {
      setCode("");
    } else {
      setLocalError(result.error);
    }
  };

  const handleRemove = () => {
    removeDiscount();
    setCode("");
    setLocalError("");
  };

  if (discountData) {
    return (
      <View style={styles.appliedBox}>
        <View style={styles.appliedRow}>
          <CheckCircle size={16} color="#16A34A" />
          <View style={styles.appliedTextBlock}>
            <Text style={styles.appliedTitle}>Discount applied!</Text>
            <Text style={styles.appliedMessage}>{discountData.message}</Text>
            {appliedDiscount > 0 && (
              <Text style={styles.appliedAmount}>-${appliedDiscount.toFixed(2)}</Text>
            )}
            {freeShipping && <Text style={styles.freeShippingText}>✓ Free shipping</Text>}
            <Text style={styles.appliedCode}>Code: {discountData.discountCode}</Text>
          </View>
          <Pressable onPress={handleRemove} style={styles.closeBtn}>
            <X size={16} color="#16A34A" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <Tag size={16} color="#A8A29E" style={styles.tagIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter discount code"
            placeholderTextColor="#A8A29E"
            value={code}
            onChangeText={(v) => {
              setCode(v);
              setLocalError("");
              clearError();
            }}
            editable={!isLoading}
            autoCapitalize="characters"
          />
        </View>
        <Pressable
          onPress={handleApply}
          disabled={isLoading || !code.trim()}
          style={[styles.applyBtn, (isLoading || !code.trim()) && { opacity: 0.5 }]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.applyBtnText}>Apply</Text>
          )}
        </Pressable>
      </View>
      {(localError || error) && <Text style={styles.errorText}>{localError || error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  inputRow: { flexDirection: "row", gap: 8 },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    height: 40,
  },
  tagIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: "#292524" },
  applyBtn: {
    backgroundColor: "#1C1917",
    paddingHorizontal: 16,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  applyBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  errorText: { fontSize: 12, color: "#DC2626" },
  appliedBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 12,
  },
  appliedRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  appliedTextBlock: { flex: 1, gap: 2 },
  appliedTitle: { fontSize: 14, fontWeight: "600", color: "#166534" },
  appliedMessage: { fontSize: 12, color: "#15803D" },
  appliedAmount: { fontSize: 14, fontWeight: "600", color: "#166534", marginTop: 4 },
  freeShippingText: { fontSize: 12, fontWeight: "600", color: "#166534" },
  appliedCode: { fontSize: 12, color: "#16A34A", marginTop: 4 },
  closeBtn: { padding: 4 },
});