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
      <View style={styles.soldOutBtn}>
        <Text style={styles.soldOutText}>Sold Out</Text>
      </View>

      <Pressable onPress={() => setIsOpen(true)} style={styles.notifyBtn}>
        <Text style={styles.notifyBtnText}>Notify Me</Text>
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
              <X size={20} color="#57534E" />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionLabel}>Size</Text>
            <View style={styles.sizeGrid}>
              {unavailableSize.map((item, i) => {
                const active = selectedSize === item?.name;
                const isOOS = item?.stockQuantity === 0;
                return (
                  <Pressable
                    key={`${item?.name}-${i}`}
                    onPress={() => setSelectedSize(item.name)}
                    style={[
                      styles.sizeBtn,
                      isOOS && !active && styles.sizeBtnOOS,
                      active && styles.sizeBtnSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        isOOS && !active && styles.sizeTextOOS,
                        active && styles.sizeTextSelected,
                      ]}
                    >
                      {item?.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Name *</Text>
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

            <Text style={styles.sectionLabel}>Email *</Text>
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
              style={[styles.submitBtn, loading && styles.submitDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>Notify me when available</Text>
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
    gap: 8,
  },
  soldOutBtn: {
    width: "100%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#F8F5F1",
  },
  soldOutText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#D6D3D1",
  },
  notifyBtn: {
    width: "100%",
    height: 44,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  notifyBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.44,
    textTransform: "uppercase",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F5F1",
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
    fontWeight: "500",
    color: "#292524",
    lineHeight: 24,
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.44,
    textTransform: "uppercase",
    color: "#A8A29E",
    marginTop: 8,
  },
  sizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeBtn: {
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 14,
    paddingVertical: 6,
    position: "relative",
    backgroundColor: "#FFFFFF",
  },
  sizeBtnSelected: {
    borderWidth: 2,
    borderColor: "#171717",
    backgroundColor: "#FFFFFF",
  },
  sizeBtnOOS: {
    borderColor: "#F5F5F4",
  },
  sizeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#78716C",
  },
  sizeTextSelected: {
    color: "#171717",
    fontWeight: "600",
  },
  sizeTextOOS: {
    color: "#E7E5E4",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#171717",
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: "#F5F5F4",
  },

  submitBtn: {
    width: "100%",
    height: 44,
    marginTop: 16,
    backgroundColor: "#AE7857",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  submitDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.44,
    textTransform: "uppercase",
  },

  successBox: {
    marginTop: 8,
    backgroundColor: "rgba(27,149,0,0.12)",
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