import { Image, StyleSheet, Text, View } from "react-native";
import { DollarSign, CreditCard, Calendar, Package } from "lucide-react-native";

import { formatCurrency } from "@/lib/format";

interface RefundDetailsProps {
  refundData: any;
}

const InfoRow = ({ icon: Icon, label, value }: any) => (
  <View style={styles.infoRow}>
    {Icon && <Icon size={12} color="#A8A29E" style={styles.icon} />}
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Not set"}</Text>
    </View>
  </View>
);

export default function RefundDetails({ refundData }: RefundDetailsProps) {
  if (!refundData) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <DollarSign size={14} color="#A8A29E" />
          <Text style={styles.title}>Refund</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{refundData.refundStatus}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.infoLabel}>Total Amount</Text>
          <Text style={styles.amountText}>
            {formatCurrency(refundData.refundTotal)}
          </Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.dateText}>
            {refundData.refundedAt
              ? formatDate(refundData.refundedAt)
              : formatDate(refundData.date)}
          </Text>
        </View>

        <InfoRow
          icon={CreditCard}
          label="Payment Method"
          value={refundData.paymentMethod || "Original Method"}
        />
      </View>

      {refundData.refundProducts && refundData.refundProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={14} color="#A8A29E" />
            <Text style={styles.sectionTitle}>
              Refunded Items ({refundData.refundProducts.length})
            </Text>
          </View>

          <View style={styles.itemList}>
            {refundData.refundProducts.map((product: any, idx: number) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.imageBox}>
                  {product?.imageUrl && (
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  )}
                </View>

                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>{product.title}</Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.metaText}>Size: {product.size}</Text>
                    <Text style={styles.metaText}>Qty: {product.quantity}</Text>
                    <Text style={styles.metaText}>
                      Price: {formatCurrency(product.price)}
                    </Text>
                  </View>

                  {product.refundReason && (
                    <Text style={styles.reasonText}>
                      Reason: {product.refundReason}
                    </Text>
                  )}
                </View>

                <Text style={styles.itemPrice}>
                  {formatCurrency(product.price * product.quantity)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {(refundData.shippingCost > 0 || refundData.reason) && (
        <View style={styles.footerSection}>
          {refundData.reason && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.infoLabel}>Reason for Refund</Text>
              <Text style={styles.reasonText}>{refundData.reason}</Text>
            </View>
          )}

          {refundData.shippingCost > 0 && (
            <View style={styles.rowBetween}>
              <Text style={styles.infoLabel}>Shipping Refund</Text>
              <Text style={styles.shippingAmount}>
                +{formatCurrency(refundData.shippingCost)}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.statusBox}>
        <Text style={styles.infoLabel}>Refund Status</Text>
        <View style={styles.statusRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{refundData.refundStatus}</Text>
          </View>
          {refundData.refundedAt && (
            <Text style={styles.dateText}>
              Processed on {formatDate(refundData.refundedAt)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.totalFooter}>
        <View>
          <Text style={styles.infoLabel}>Total Refund Amount</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(refundData.refundTotal)}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.infoLabel, { letterSpacing: 1.5 }]}>
            INCLUDES
          </Text>
          <Text style={styles.breakdownText}>
            Items: {formatCurrency(refundData.refundTotal - (refundData.shippingCost || 0))}
          </Text>
          {refundData.shippingCost > 0 && (
            <Text style={styles.breakdownText}>
              Shipping: {formatCurrency(refundData.shippingCost)}
            </Text>
          )}
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
  gridItem: {
    flex: 1,
    minWidth: "45%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    minWidth: "45%",
    flex: 1,
  },
  icon: {
    marginTop: 2,
    marginRight: 6,
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
  amountText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#292524",
    marginTop: 2,
  },
  dateText: {
    fontSize: 13,
    color: "#44403C",
    marginTop: 2,
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
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#292524",
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    paddingTop: 12,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shippingAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#292524",
  },
  statusBox: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 12,
    backgroundColor: "#FAFAF9",
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  totalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    paddingTop: 16,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "600",
    color: "#292524",
    marginTop: 2,
  },
  breakdownText: {
    fontSize: 11,
    color: "#78716C",
  },
});