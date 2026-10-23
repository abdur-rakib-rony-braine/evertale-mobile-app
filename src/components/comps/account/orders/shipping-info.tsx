import { StyleSheet, Text, View, Pressable, Linking } from "react-native";
import { ExternalLink } from "lucide-react-native";

interface ShippingInfoProps {
  orderData: any;
}

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueContainer}>{value}</View>
  </View>
);

export default function ShippingInfo({ orderData }: ShippingInfoProps) {
  if (!orderData) return null;

  const { trackingInfo, shipping, deliveryStatus, deliveryInstructions } =
    orderData;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <InfoRow
          label="Status"
          value={<Text style={styles.infoText}>{deliveryStatus || "Pending"}</Text>}
        />
        <InfoRow
          label="Method"
          value={<Text style={styles.infoText}>{shipping?.method || "Standard"}</Text>}
        />
      </View>

      {trackingInfo && (
        <View style={styles.trackingBox}>
          <InfoRow
            label="Tracking Information"
            value={
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "500", color: "#292524" }}>
                  {trackingInfo.carrier}:
                </Text>{" "}
                {trackingInfo.trackingNumber}
              </Text>
            }
          />

          {trackingInfo.shipping?.cost > 0 && (
            <Text style={styles.costText}>
              Shipping cost: ${trackingInfo.shipping.cost} ({trackingInfo.shipping.paidBy})
            </Text>
          )}

          <Pressable
            style={styles.trackBtn}
            onPress={() =>
              Linking.openURL(
                `https://auspost.com.au/track/track.html?id=${trackingInfo.trackingNumber}`
              )
            }
          >
            <ExternalLink size={12} color="#292524" />
            <Text style={styles.trackBtnText}>TRACK</Text>
          </Pressable>
        </View>
      )}

      {deliveryInstructions && (
        <InfoRow
          label="Delivery Instructions"
          value={<Text style={styles.infoText}>{deliveryInstructions}</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  infoRow: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#A8A29E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValueContainer: {
    flexDirection: "row",
  },
  infoText: {
    fontSize: 14,
    color: "#44403C",
    lineHeight: 20,
  },
  trackingBox: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FAFAF9",
    padding: 12,
    gap: 12,
    alignItems: "flex-start",
  },
  costText: {
    fontSize: 11,
    color: "#78716C",
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  trackBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#292524",
    letterSpacing: 1,
  },
});