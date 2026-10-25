import { useEffect, useState } from "react";
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
import { X } from "lucide-react-native";
import Toast from "react-native-toast-message";

import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";
import type { Product } from "@/lib/api/products";

interface SoldOutProps {
  product: Product;
  productSize: string;
}

interface SizeOption {
  _id?: string;
  name: string;
  stockQuantity: number;
}

const showSuccess = (message: string) =>
  Toast.show({ type: "success", text1: message });

const showError = (title: string, message?: string) =>
  Toast.show({ type: "error", text1: title, text2: message });

const SoldOut = ({ product, productSize }: SoldOutProps) => {
  const user = useAuthStore((s) => s.user);

  const [unavailableSize, setUnavailableSize] = useState<SizeOption[]>([]);
  const [selectedSize, setSelectedSize] = useState(productSize);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [success, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unavailable = (product?.sizes || []).filter(
      (item) => item?.stockQuantity === 0
    );
    setUnavailableSize(unavailable);
    setSelectedSize(productSize);
    setSuccess(false);
  }, [product, productSize]);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (user?.firstName) setName(user.firstName);
  }, [user]);

  const handleNotifyMe = async () => {
    setSuccess(false);

    const activeEmail = user?.email || email;
    const activeName = user?.firstName || name;

    if (!activeEmail) {
      return showError("Missing email", "Please enter your email");
    }
    if (!selectedSize) {
      return showError("Missing size", "Please select a size");
    }
    if (!activeName) {
      return showError("Missing name", "Please enter your name");
    }

    try {
      setLoading(true);
      const { data } = await apiClient.post("/api/product-request/create", {
        email: activeEmail,
        customerName: activeName,
        size: selectedSize,
        product,
        requestTime: new Date(),
      });

      if (data.success) {
        setSuccess(true);
        showSuccess("You're in! We'll let you know when it's back.");

        if (!user) {
          setEmail("");
          setName("");
        }

        setIsOpen(false);
      } else {
        showError(data.message || "Something went wrong.");
      }
    } catch {
      showError("Failed to submit your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.soldOutButton}>
        <Text style={styles.soldOutText}>Sold Out</Text>
      </View>

      <Pressable
        onPress={() => setIsOpen(true)}
        style={styles.notifyButton}
      >
        <Text style={styles.notifyButtonText}>NOTIFY ME</Text>
      </Pressable>

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>{product?.title}</Text>
              <Text style={styles.modalDescription}>
                Register to receive a notification when this item comes back in
                stock.
              </Text>
            </View>
            <Pressable
              onPress={() => setIsOpen(false)}
              hitSlop={8}
              style={styles.closeButton}
              accessibilityLabel="Close"
            >
              <X size={20} color="#1C1917" />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalBody}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>Size</Text>
            <View style={styles.sizeRow}>
              {unavailableSize.map((item, i) => {
                const active = selectedSize === item?.name;
                return (
                  <Pressable
                    key={`${item?.name}-${i}`}
                    onPress={() => setSelectedSize(item.name)}
                    style={[
                      styles.sizeChip,
                      active && styles.sizeChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sizeChipText,
                        active && styles.sizeChipTextActive,
                      ]}
                    >
                      {item?.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name *"
              placeholderTextColor="#A8A29E"
              editable={!user?.firstName}
              style={[
                styles.input,
                !!user?.firstName && styles.inputDisabled,
              ]}
            />

            <Text style={styles.label}>Email *</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email *"
              placeholderTextColor="#A8A29E"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!user?.email}
              style={[styles.input, !!user?.email && styles.inputDisabled]}
            />

            <Pressable
              onPress={handleNotifyMe}
              disabled={loading}
              style={[styles.submitButton, loading && styles.submitDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Notify me when available
                </Text>
              )}
            </Pressable>

            {success ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  You're in! We'll let you know when it's back.
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  soldOutButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#DC2626",
    paddingVertical: 24,
    alignItems: "center",
  },
  soldOutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
  notifyButton: {
    width: "100%",
    backgroundColor: "#000000",
    paddingVertical: 12,
    alignItems: "center",
  },
  notifyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    gap: 12,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1917",
    textTransform: "capitalize",
  },
  modalDescription: {
    marginTop: 8,
    fontSize: 13,
    color: "#78716C",
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },

  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#78716C",
    marginTop: 8,
  },
  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D6D3D1",
    backgroundColor: "#F9FAFB",
  },
  sizeChipActive: {
    borderWidth: 2,
    borderColor: "#1C1917",
    backgroundColor: "#FFFFFF",
  },
  sizeChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#57534E",
  },
  sizeChipTextActive: {
    color: "#1C1917",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#1C1917",
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: "#F3F4F6",
  },

  submitButton: {
    marginTop: 16,
    backgroundColor: "#AE7857",
    paddingVertical: 16,
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  successBox: {
    marginTop: 8,
    backgroundColor: "rgba(27,149,0,0.24)",
    paddingVertical: 16,
    alignItems: "center",
  },
  successText: {
    fontSize: 12,
    color: "#15803D",
    textAlign: "center",
  },
});

export default SoldOut;