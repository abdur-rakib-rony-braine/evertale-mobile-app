import { Map, MapPin, X } from "lucide-react-native";
import { useState } from "react";
import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { getFullAddress, getShortAddress } from "./order-utils";

interface AddressDialogProps {
  address?: any;
}

export default function AddressDialog({ address }: AddressDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!address) return null;

  const fullAddress = getFullAddress(address);

  const openInMaps = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    );
  };

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setIsOpen(true)} hitSlop={6}>
        <MapPin size={14} color="#A8A29E" strokeWidth={1.8} />
        <Text style={styles.triggerText} numberOfLines={1}>
          {getShortAddress(address)}
        </Text>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.content} onPress={() => {}}>
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <MapPin size={16} color="#A8A29E" strokeWidth={1.8} />
                <Text style={styles.title}>Delivery Address</Text>
              </View>
              <Pressable onPress={() => setIsOpen(false)} hitSlop={10}>
                <X size={20} color="#78716C" />
              </Pressable>
            </View>

            <View style={styles.body}>
              <View style={styles.addressBox}>
                <Text style={styles.addressLabel}>SHIPPING ADDRESS</Text>
                <Text style={styles.addressText}>{fullAddress}</Text>
              </View>

              <Pressable style={styles.mapBtn} onPress={openInMaps}>
                <Map size={16} color="#FFFFFF" />
                <Text style={styles.mapBtnText}>OPEN IN MAPS</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  triggerText: {
    flex: 1,
    fontSize: 12,
    color: "#A8A29E",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F5F5F4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
  },
  body: {
    padding: 16,
    gap: 12,
  },
  addressBox: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FAFAF9",
    padding: 16,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "#A8A29E",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#44403C",
  },
  mapBtn: {
    height: 44,
    backgroundColor: "#AE7857",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mapBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
});