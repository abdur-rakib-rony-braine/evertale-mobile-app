import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import Toast from "react-native-toast-message";

import { useReturnStore } from "@/store/return-store";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api/client";

import ReturnItemCard from "./return-item-card";
import ReturnSummary from "./return-summary";

interface ReturnContentProps {
  onClose: () => void;
}

export default function ReturnContent({ onClose }: ReturnContentProps) {
  const user = useAuthStore((state) => state.user);

  const {
    currentOrder,
    availableItems = [],
    selectedProducts,
    returnReason,
    setReturnReason,
    shippingMethod,
    setShippingMethod,
    isProcessing,
    setProcessing,
    toggleSelectedProduct,
    reset,
  } = useReturnStore();

  const [isFetchingShipping, setIsFetchingShipping] = useState(false);

  const returnItems = useMemo(() => selectedProducts, [selectedProducts]);

  const productCost = useMemo(
    () => returnItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [returnItems]
  );

  const originalShipping = currentOrder?.shipping?.cost || 0;
  const totalRefundAmount = productCost - (shippingMethod?.cost || 0);

  useEffect(() => {
    const fetchShipping = async () => {
      setIsFetchingShipping(true);
      try {
        const res = await apiClient.get("/api/admin/shipping");
        if (res.data.success) {
          const defaultMethod =
            res.data.data.find((m: any) => m.isDefault) || res.data.data[0];
          setShippingMethod(defaultMethod);
        }
      } catch (error) {
        console.error("Failed to fetch shipping methods", error);
      } finally {
        setIsFetchingShipping(false);
      }
    };

    if (!shippingMethod) fetchShipping();
  }, [setShippingMethod, shippingMethod]);

  const handleProcessReturn = async () => {
    if (returnItems.length === 0) {
      Toast.show({ type: "error", text1: "Please select at least one product." });
      return;
    }

    setProcessing(true);
    try {
      const res = await apiClient.post("/api/return-request", {
        orderId: currentOrder._id,
        requestUser: user?.email,
        reason: returnReason,
        returnItems,
        shippingMethod: shippingMethod?.name,
        shippingCost: shippingMethod?.cost,
        refundAmount: Math.max(totalRefundAmount, 0),
      });

      if (res.data.success) {
        Toast.show({
          type: "success",
          text1: "Return request submitted successfully",
        });
        reset();
        onClose();
      } else {
        throw new Error(res.data.error || "Failed request");
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.error || err.message || "Something went wrong",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        {availableItems.map((p: any) => (
          <ReturnItemCard
            key={`${p.productId}-${p.size}`}
            product={p}
            selected={selectedProducts.some(
              (sp) => sp.productId === p.productId && sp.size === p.size
            )}
            onToggle={() => toggleSelectedProduct(p)}
          />
        ))}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Return Reason (optional)</Text>
        <TextInput
          style={styles.textArea}
          value={returnReason}
          onChangeText={setReturnReason}
          multiline
          numberOfLines={3}
          placeholder="Tell us why..."
          placeholderTextColor="#A8A29E"
          textAlignVertical="top"
        />
      </View>

      {selectedProducts.length === 0 && (
        <View style={styles.infoAlert}>
          <CheckCircle2 size={18} color="#2563EB" />
          <Text style={styles.infoAlertText}>
            Select at least one item to continue.
          </Text>
        </View>
      )}

      {selectedProducts.length > 0 && (
        <>
          {isFetchingShipping ? (
            <ActivityIndicator color="#AE7857" />
          ) : (
            <ReturnSummary
              originalShipping={originalShipping}
              returnShipping={shippingMethod}
              productCost={productCost}
              totalRefundAmount={totalRefundAmount}
              orderTotal={currentOrder?.total}
            />
          )}

          <View style={styles.actionRow}>
            <Pressable
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isProcessing}
            >
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </Pressable>

            {totalRefundAmount < 0 ? (
              <View style={styles.infoAlert}>
                <Text style={styles.infoAlertText}>
                  Payment required to process this return. Please use the website.
                </Text>
              </View>
            ) : (
              <Pressable
                style={[styles.submitBtn, isProcessing && { opacity: 0.7 }]}
                onPress={handleProcessReturn}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>PROCESS RETURN</Text>
                )}
              </Pressable>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  list: {
    gap: 4,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#292524",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#E7E5E4",
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    color: "#292524",
  },
  infoAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    padding: 12,
  },
  infoAlertText: {
    flex: 1,
    fontSize: 13,
    color: "#1D4ED8",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    color: "#78716C",
  },
  submitBtn: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#AE7857",
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    color: "#FFFFFF",
  },
});