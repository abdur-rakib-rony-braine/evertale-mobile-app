import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Package, X } from "lucide-react-native";

import { useExchangeStore } from "@/store/exchange-store";
import ExchangeContent from "./exchange-content";

interface ExchangeDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ExchangeDialog({ open, onClose }: ExchangeDialogProps) {
  const currentOrder = useExchangeStore((state) => state.currentOrder);

  if (!currentOrder) return null;

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Package size={20} color="#292524" />
              <Text style={styles.headerTitle}>Exchange Items</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color="#78716C" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <ExchangeContent onClose={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
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
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#292524",
  },
  scrollContent: {
    paddingBottom: 40,
  },
});