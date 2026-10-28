import { StyleSheet, Text, View } from "react-native";
import { Repeat, ArrowRightLeft, Truck } from "lucide-react-native";
import { formatCurrency } from "@/lib/format";
import { Image } from "expo-image";

interface ExchangeDetailsProps {
  exchangeData: any;
}

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "Not set"}</Text>
  </View>
);

export default function ExchangeDetails({ exchangeData }: ExchangeDetailsProps) {
  if (!exchangeData) return null;

  const originalItems = exchangeData.exchangeRequestItems?.map((item: any) => item.originalProductData) || [];
  const newItems = exchangeData.exchangeRequestItems?.map((item: any) => item.newProductData) || [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Repeat size={14} color="#A8A29E" />
          <Text style={styles.title}>Exchange</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{exchangeData.status}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <InfoRow label="Reason" value={exchangeData.reason || "Not specified"} />
        <InfoRow label="Exchange Count" value={exchangeData.exchangeCount || 1} />
        <InfoRow
          label="Eligible Until"
          value={new Date(exchangeData.exchangeEligibilityEndDate).toLocaleDateString()}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ArrowRightLeft size={14} color="#A8A29E" />
          <Text style={styles.sectionTitle}>Exchange Items</Text>
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.subTitle}>Original Items (Returned)</Text>
          {originalItems.map((item: any, idx: number) => (
            <View key={`orig-${idx}`} style={styles.itemRow}>
              <View style={styles.imageBox}>
                {item?.imageUrl && (
                  <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                )}
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item?.title}</Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.metaText}>Size: {item?.size}</Text>
                  <Text style={styles.metaText}>Qty: {item?.quantity}</Text>
                  <Text style={styles.metaText}>Price: {formatCurrency(item?.price || 0)}</Text>
                </View>
                {exchangeData.exchangeRequestItems?.[idx]?.exchangeReason && (
                  <Text style={styles.reasonText}>
                    Reason: {exchangeData.exchangeRequestItems[idx].exchangeReason}
                  </Text>
                )}
              </View>
              <Text style={styles.itemPriceNegative}>
                -{formatCurrency((item?.price || 0) * (item?.quantity || 1))}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.subTitle}>New Items (Received)</Text>
          {newItems.map((item: any, idx: number) => (
            <View key={`new-${idx}`} style={styles.itemRow}>
              <View style={styles.imageBox}>
                {item?.imageUrl && (
                  <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                )}
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item?.title}</Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.metaText}>Size: {item?.size}</Text>
                  <Text style={styles.metaText}>Qty: {item?.quantity}</Text>
                  <Text style={styles.metaText}>Price: {formatCurrency(item?.price || 0)}</Text>
                </View>
              </View>
              <Text style={styles.itemPricePositive}>
                +{formatCurrency((item?.price || 0) * (item?.quantity || 1))}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {(exchangeData.exchangeShipment || exchangeData.returnShipment) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={14} color="#A8A29E" />
            <Text style={styles.sectionTitle}>Shipping Information</Text>
          </View>

          <View style={styles.shippingGrid}>
            {exchangeData.returnShipment && (
              <View style={styles.shippingBox}>
                <InfoRow
                  label="Return Shipment"
                  value={`${exchangeData.returnShipment.carrier}: ${exchangeData.returnShipment.trackingNumber}`}
                />
                <Text style={styles.shippingCostText}>
                  Cost: {formatCurrency(exchangeData.returnShipment.shipping?.cost || 0)}
                </Text>
              </View>
            )}
            {exchangeData.exchangeShipment && (
              <View style={styles.shippingBox}>
                <InfoRow
                  label="Exchange Shipment"
                  value={`${exchangeData.exchangeShipment.carrier}: ${exchangeData.exchangeShipment.trackingNumber}`}
                />
                <Text style={styles.shippingCostText}>
                  Cost: {formatCurrency(exchangeData.exchangeShipment.shipping?.cost || 0)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View>
          <Text style={styles.infoLabel}>Refund Amount</Text>
          <Text style={styles.refundAmount}>
            {formatCurrency(exchangeData.refundAmount || 0)}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.infoLabel}>Refund Status</Text>
          <View style={[styles.badge, { marginTop: 4 }]}>
            <Text style={styles.badgeText}>{exchangeData.refundStatus}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: "600",
    color: "#A8A29E",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  badge: {
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#FAFAF9",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#44403C",
    textTransform: "capitalize",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  infoRow: {
    flex: 1,
    minWidth: "45%",
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#A8A29E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    color: "#292524",
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#A8A29E",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  itemsSection: {
    marginBottom: 16,
    gap: 12,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#44403C",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 12,
    backgroundColor: "#FAFAF9",
  },
  imageBox: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FFFFFF",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#292524",
  },
  itemMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaText: {
    fontSize: 11,
    color: "#78716C",
  },
  reasonText: {
    fontSize: 11,
    color: "#78716C",
    fontStyle: "italic",
  },
  itemPriceNegative: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A8A29E",
  },
  itemPricePositive: {
    fontSize: 13,
    fontWeight: "600",
    color: "#292524",
  },
  shippingGrid: {
    gap: 12,
  },
  shippingBox: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 12,
    backgroundColor: "#FAFAF9",
  },
  shippingCostText: {
    fontSize: 11,
    color: "#78716C",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    paddingTop: 16,
  },
  refundAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#292524",
    marginTop: 4,
  },
});