import { StyleSheet, Text, View } from "react-native";

import { formatCurrency } from "@/lib/format";

interface OrderSummaryProps {
  orderData: any;
}

const Row = ({ label, value, valueColor = "#44403C" }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
  </View>
);

export default function OrderSummary({ orderData }: OrderSummaryProps) {
  if (!orderData) return null;

  const refundTotal =
    orderData.refunds?.reduce((sum: number, r: any) => sum + (r.refundTotal || 0), 0) || 0;
  const discountTotal =
    orderData.discount?.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0;
  const finalTotal = Math.max(0, (orderData.total || 0) - refundTotal);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>ORDER SUMMARY</Text>

      <View style={styles.list}>
        <Row label="Subtotal" value={formatCurrency(orderData.subtotal)} />

        {discountTotal > 0 && (
          <Row
            label="Discount"
            value={`-${formatCurrency(discountTotal)}`}
            valueColor="#16A34A"
          />
        )}

        <Row label="Shipping" value={formatCurrency(orderData.shipping?.cost || 0)} />

        {orderData.gst > 0 && (
          <Row label="GST" value={formatCurrency(orderData.gst)} />
        )}

        {refundTotal > 0 && (
          <Row
            label="Refunds"
            value={`-${formatCurrency(refundTotal)}`}
            valueColor="#F97316"
          />
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(finalTotal)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#A8A29E",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#78716C",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F4",
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#44403C",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#292524",
  },
});