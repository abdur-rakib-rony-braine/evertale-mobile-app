import { StyleSheet, Text, View, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ExternalLink } from "lucide-react-native";

import { formatCurrency } from "@/lib/format";

interface ShippingInfoProps {
  orderData: any;
}

const InfoRow = ({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: any;
  fullWidth?: boolean;
}) => (
  <View style={[styles.infoRow, fullWidth && styles.infoRowFull]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueContainer}>{value}</View>
  </View>
);

export default function ShippingInfo({ orderData }: ShippingInfoProps) {
  const insets = useSafeAreaInsets();

  if (!orderData) return null;

  const { trackingInfo, shipping, deliveryStatus, deliveryInstructions } =
    orderData;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 0) + 8 },
      ]}
    >
      <View style={styles.row}>
        <InfoRow
          label="Status"
          value={
            <Text style={styles.infoText} numberOfLines={2}>
              {deliveryStatus || "Pending"}
            </Text>
          }
        />
        <InfoRow
          label="Method"
          value={
            <Text style={styles.infoText} numberOfLines={2}>
              {shipping?.method || "Standard"}
            </Text>
          }
        />
      </View>

      {trackingInfo && (
        <View style={styles.trackingBox}>
          <InfoRow
            fullWidth
            label="Tracking Information"
            value={
              <Text style={styles.infoText} numberOfLines={2}>
                <Text style={styles.infoStrong}>
                  {trackingInfo.carrier}:
                </Text>{" "}
                {trackingInfo.trackingNumber}
              </Text>
            }
          />

          {trackingInfo.shipping?.cost > 0 && (
            <Text style={styles.costText}>
              Shipping cost: {formatCurrency(trackingInfo.shipping.cost)} (
              {trackingInfo.shipping.paidBy})
            </Text>
          )}

          <Pressable
            style={styles.trackBtn}
            onPress={() =>
              Linking.openURL(
                `https://auspost.com.au/track/track.html?id=${trackingInfo.trackingNumber}`
              )
            }
            accessibilityRole="link"
            accessibilityLabel="Track shipment"
          >
            <ExternalLink size={12} color="#292524" />
            <Text style={styles.trackBtnText}>TRACK</Text>
          </Pressable>
        </View>
      )}

      {deliveryInstructions ? (
        <InfoRow
          fullWidth
          label="Delivery Instructions"
          value={<Text style={styles.infoText}>{deliveryInstructions}</Text>}
        />
      ) : null}
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
    flexWrap: "wrap",
  },
  infoRow: {
    flexGrow: 1,
    flexBasis: "45%",
    minWidth: 120,
    gap: 4,
  },
  infoRowFull: {
    flexBasis: "100%",
    minWidth: "100%",
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
    flexShrink: 1,
  },
  infoText: {
    fontSize: 14,
    color: "#44403C",
    lineHeight: 20,
    flexShrink: 1,
  },
  infoStrong: {
    fontWeight: "500",
    color: "#292524",
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