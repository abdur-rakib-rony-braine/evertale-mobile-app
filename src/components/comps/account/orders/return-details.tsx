import { Image, StyleSheet, Text, View } from "react-native";
import { RefreshCw, Truck, Package } from "lucide-react-native";

import { formatCurrency } from "@/lib/format";

interface ReturnDetailsProps {
  returnData: any;
}

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "Not set"}</Text>
  </View>
);

export default function ReturnDetails({ returnData }: ReturnDetailsProps) {
  if (!returnData) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <RefreshCw size={14} color="#A8A29E" />
          <Text style={styles.title}>Return</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{returnData.status}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <InfoRow label="Reason" value={returnData.reason || "Not specified"} />
        <InfoRow label="Requested by" value={returnData.requestUser || "Customer"} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Package size={14} color="#A8A29E" />
          <Text style={styles.sectionTitle}>
            Returned Items ({returnData.returnItems?.length || 0})
          </Text>
        </View>

        <View style={styles.itemList}>
          {returnData.returnItems?.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.imageBox}>
                {item.product?.imageUrl && (
                  <Image
                    source={{ uri: item.product.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                )}
              </View>

              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.product?.title}</Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.metaText}>Size: {item.product?.size || "N/A"}</Text>
                  <Text style={styles.metaText}>Qty: {item.quantity}</Text>
                  <Text style={styles.metaText}>
                    Price: {formatCurrency(item.product?.price || 0)}
                  </Text>
                </View>
                {item.product?.returnReason && (
                  <Text style={styles.reasonText}>
                    Reason: {item.product.returnReason}
                  </Text>
                )}
              </View>

              <Text style={styles.itemPrice}>
                {formatCurrency((item.product?.price || 0) * item.quantity)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {returnData.returnShipment && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={14} color="#A8A29E" />
            <Text style={styles.sectionTitle}>Return Shipping</Text>
          </View>

          <View style={styles.shippingBox}>
            <View style={styles.grid}>
              <InfoRow label="Carrier" value={returnData.returnShipment.carrier} />
              <InfoRow label="Tracking" value={returnData.returnShipment.trackingNumber} />
              <InfoRow
                label="Cost"
                value={formatCurrency(returnData.returnShipment.shipping?.cost || 0)}
              />
              <InfoRow label="Paid by" value={returnData.returnShipment.shipping?.paidBy} />
            </View>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View>
          <Text style={styles.infoLabel}>Refund Status</Text>
          <View style={[styles.badge, { marginTop: 4 }]}>
            <Text style={styles.badgeText}>{returnData.refundStatus}</Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.infoLabel}>Refund Amount</Text>
          <Text style={styles.refundAmount}>
            {formatCurrency(returnData.refundAmount || 0)}
          </Text>
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
  itemList: {
    gap: 12,
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
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#292524",
  },
  shippingBox: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 12,
    backgroundColor: "#FAFAF9",
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