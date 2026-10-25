import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CheckCircle, Circle, ChevronDown, X } from "lucide-react-native";
import Toast from "react-native-toast-message";

import { useCheckoutStore } from "@/store/checkout-store";
import { apiClient } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format"; // Make sure you have this

const DELIVERY_OPTIONS = [
  "Leave out of the weather",
  "Leave near front door",
  "Leave at reception",
  "Send to the Post Office",
  "Specify special instructions",
];

interface ShippingMethod {
  _id: string;
  name: string;
  cost: number;
  estimatedDelivery: string;
  description?: string;
  freeShippingThreshold?: number;
  isActive: boolean;
}

const Shipping = () => {
  const {
    setShipping,
    shipping,
    setDeliveryInstruction,
    setNotes,
    deliveryInstructions: persistedDeliveryInstructions,
    notes: persistedNotes,
    orderTotal = 0,
  } = useCheckoutStore();

  const [notHome, setNotHome] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInstructionsPicker, setShowInstructionsPicker] = useState(false);

  useEffect(() => {
    if (persistedDeliveryInstructions) {
      if (persistedDeliveryInstructions === "Specify special instructions") {
        setNotHome("Specify special instructions");
      } else if (DELIVERY_OPTIONS.includes(persistedDeliveryInstructions)) {
        setNotHome(persistedDeliveryInstructions);
      } else {
        setNotHome("Specify special instructions");
        setSpecialInstructions(persistedDeliveryInstructions);
      }
    }
    if (persistedNotes) setOrderNotes(persistedNotes);
  }, [persistedDeliveryInstructions, persistedNotes]);

  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get("/api/admin/shipping");
        if (data.success) {
          setShippingMethods(data.data);
          if (!shipping && data.data.length > 0) {
            handleShippingSelect(data.data.find((m: any) => m.isActive) || data.data[0]);
          }
        }
      } catch (error) {
        console.log("Failed to fetch shipping methods", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShippingMethods();
  }, []); // eslint-disable-line

  const handleShippingSelect = useCallback(
    (method: ShippingMethod) => {
      const isFree =
        method.freeShippingThreshold && orderTotal >= method.freeShippingThreshold;
      setShipping({
        id: method._id,
        method: method.name,
        cost: isFree ? 0 : method.cost,
        originalCost: method.cost,
        isFree,
        estimatedDelivery: method.estimatedDelivery,
        description: method.description,
        freeShippingThreshold: method.freeShippingThreshold,
      });
    },
    [orderTotal, setShipping]
  );

  const handleInstructionSelect = (value: string) => {
    setNotHome(value);
    setShowInstructionsPicker(false);
    if (value === "Specify special instructions") {
      setSpecialInstructions("");
      setDeliveryInstruction("");
    } else {
      setSpecialInstructions("");
      setDeliveryInstruction(value);
    }
  };

  const handleSpecialInstructionsChange = (value: string) => {
    setSpecialInstructions(value);
    setDeliveryInstruction(value);
  };

  const handleNotesChange = (value: string) => {
    setOrderNotes(value);
    setNotes(value);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={styles.stepText}>Step 3</Text>
        <Text style={styles.heading}>Delivery Options</Text>
      </View>

      <View style={styles.methodsList}>
        {loading ? (
          <ActivityIndicator size="small" color="#AE7857" style={{ marginTop: 20 }} />
        ) : (
          shippingMethods.map((method) => {
            const isSelected = shipping?.id === method._id;
            const isFree =
              method.freeShippingThreshold && orderTotal >= method.freeShippingThreshold;

            return (
              <Pressable
                key={method._id}
                onPress={() => handleShippingSelect(method)}
                style={[
                  styles.methodRow,
                  isSelected && styles.methodRowActive,
                ]}
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
                        styles.methodName,
                        isSelected && styles.methodNameActive,
                      ]}
                    >
                      {method.name}
                    </Text>
                    <Text style={styles.methodEst}>
                      Est. delivery:{" "}
                      <Text style={styles.methodEstHighlight}>
                        {method.estimatedDelivery}
                      </Text>
                    </Text>
                    {method.description && (
                      <Text style={styles.methodDesc}>{method.description}</Text>
                    )}
                    {isFree && method.freeShippingThreshold! > 0 && (
                      <Text style={styles.freeText}>Free shipping applied</Text>
                    )}
                  </View>
                </View>
                <Text
                  style={[
                    styles.methodCost,
                    isFree
                      ? styles.methodCostFree
                      : isSelected
                      ? styles.methodCostActive
                      : styles.methodCostInactive,
                  ]}
                >
                  {isFree ? "FREE" : formatCurrency(method.cost)}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>

      <View style={styles.formBlock}>
        <View style={styles.field}>
          <Text style={styles.label}>If you're not home</Text>
          <Pressable
            style={styles.selectTrigger}
            onPress={() => setShowInstructionsPicker(true)}
          >
            <Text
              style={[
                styles.selectText,
                !notHome && styles.selectPlaceholder,
              ]}
              numberOfLines={1}
            >
              {notHome || "Select delivery instructions"}
            </Text>
            <ChevronDown size={16} color="#78716C" />
          </Pressable>
        </View>

        {notHome === "Specify special instructions" && (
          <View style={styles.specialBox}>
            <Text style={styles.label}>
              Special Instructions{" "}
              <Text style={styles.optional}>(max 90 characters)</Text>
            </Text>
            <TextInput
              style={styles.textarea}
              maxLength={90}
              multiline
              value={specialInstructions}
              placeholder="Leave my order in a safe place..."
              placeholderTextColor="#A8A29E"
              onChangeText={handleSpecialInstructionsChange}
            />
            <Text style={styles.charCount}>
              {specialInstructions.length}/90
            </Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>
            Order Notes <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={[styles.textarea, { minHeight: 90 }]}
            multiline
            value={orderNotes}
            onChangeText={handleNotesChange}
            placeholder="Additional instructions or notes for your order..."
            placeholderTextColor="#A8A29E"
          />
        </View>
      </View>

      <Modal
        visible={showInstructionsPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInstructionsPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowInstructionsPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery Instructions</Text>
              <Pressable onPress={() => setShowInstructionsPicker(false)}>
                <X size={20} color="#78716C" />
              </Pressable>
            </View>
            <ScrollView>
              {DELIVERY_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.modalItem,
                    notHome === option && styles.modalItemActive,
                  ]}
                  onPress={() => handleInstructionSelect(option)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      notHome === option && styles.modalItemTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                  {notHome === option && (
                    <CheckCircle size={16} color="#AE7857" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

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
  methodsList: {
    gap: 8,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  methodRowActive: {
    borderColor: "#AE7857",
    backgroundColor: "#FDF8F4",
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#44403C",
    marginBottom: 2,
  },
  methodNameActive: {
    color: "#1C1917",
  },
  methodEst: {
    fontSize: 12,
    color: "#A8A29E",
  },
  methodEstHighlight: {
    color: "#78716C",
    fontWeight: "500",
  },
  methodDesc: {
    fontSize: 12,
    color: "#A8A29E",
    marginTop: 2,
  },
  freeText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  methodCost: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 16,
  },
  methodCostFree: {
    color: "#16A34A",
  },
  methodCostActive: {
    color: "#AE7857",
  },
  methodCostInactive: {
    color: "#44403C",
  },
  formBlock: {
    gap: 20,
    paddingTop: 8,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#78716C",
  },
  optional: {
    fontSize: 12,
    color: "#A8A29E",
    fontWeight: "400",
    textTransform: "none",
    letterSpacing: 0,
  },
  selectTrigger: {
    height: 40,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 14,
    color: "#292524",
    flex: 1,
  },
  selectPlaceholder: {
    color: "#A8A29E",
  },
  specialBox: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 16,
    gap: 8,
  },
  textarea: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    padding: 12,
    fontSize: 14,
    color: "#292524",
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#A8A29E",
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#292524",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  modalItemActive: {
    backgroundColor: "#FDF8F4",
  },
  modalItemText: {
    fontSize: 14,
    color: "#44403C",
  },
  modalItemTextActive: {
    color: "#AE7857",
    fontWeight: "500",
  },
});

export default Shipping;