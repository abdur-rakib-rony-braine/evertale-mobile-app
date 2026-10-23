import { StyleSheet, Text, View } from "react-native";
import { Info, CheckCircle, XCircle, Truck, Package } from "lucide-react-native";

import { formatCurrency } from "@/lib/format";

interface ReturnSummaryProps {
  originalShipping?: number;
  returnShipping: any;
  productCost: number;
  totalRefundAmount: number;
  refunds?: any[];
  orderTotal?: number;
}

export default function ReturnSummary({
  returnShipping,
  productCost,
  totalRefundAmount,
  refunds = [],
  orderTotal = 0,
}: ReturnSummaryProps) {
  const totalAlreadyRefunded = refunds.reduce(
    (sum, r) => sum + (r?.refundTotal || 0),
    0
  );
  const isFullyRefunded = totalAlreadyRefunded >= orderTotal;
  const remainingRefundAmount = Math.max(0, totalRefundAmount - totalAlreadyRefunded);

  const getStatusConfig = () => {
    if (totalRefundAmount === 0) {
      return {
        icon: <Info size={20} color="#78716C" />,
        title: "No Refund Balance",
        description:
          "The product value and return shipping balance each other out. No payment or refund is required.",
        style: styles.alertNeutral,
        titleStyle: styles.alertTitleNeutral,
        descStyle: styles.alertDescNeutral,
      };
    }

    if (totalRefundAmount < 0) {
      return {
        icon: <XCircle size={20} color="#0D9488" />,
        title: "Additional Payment Required",
        description: `You need to pay ${formatCurrency(
          Math.abs(totalRefundAmount)
        )} to complete this return due to return shipping costs.`,
        style: styles.alertInfo,
        titleStyle: styles.alertTitleInfo,
        descStyle: styles.alertDescInfo,
      };
    }

    return null;
  };

  const status = getStatusConfig();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Return Summary</Text>

      <View style={styles.list}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Package size={16} color="#78716C" />
            <Text style={styles.label}>Returned Items Value</Text>
          </View>
          <Text style={styles.value}>{formatCurrency(productCost)}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Truck size={16} color="#78716C" />
            <Text style={styles.label}>Return Shipping</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{returnShipping?.name}</Text>
            </View>
          </View>
          <Text style={styles.valueNegative}>
            - {formatCurrency(returnShipping?.cost)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {!isFullyRefunded && remainingRefundAmount > 0 && (
        <View style={[styles.alert, styles.alertSuccess]}>
          <CheckCircle size={20} color="#16A34A" />
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, styles.alertTitleSuccess]}>
              Refund Available
            </Text>
            <Text style={[styles.alertDesc, styles.alertDescSuccess]}>
              You will receive a refund back to your original payment method after
              inspection.
            </Text>
          </View>
        </View>
      )}

      {status && (
        <View style={[styles.alert, status.style]}>
          {status.icon}
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, status.titleStyle]}>
              {status.title}
            </Text>
            <Text style={[styles.alertDesc, status.descStyle]}>
              {status.description}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#292524",
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: "#44403C",
  },
  value: {
    fontSize: 13,
    fontWeight: "500",
    color: "#292524",
  },
  valueNegative: {
    fontSize: 13,
    fontWeight: "500",
    color: "#DC2626",
  },
  badge: {
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#78716C",
  },
  divider: {
    height: 1,
    backgroundColor: "#E7E5E4",
  },
  alert: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  alertContent: {
    flex: 1,
    gap: 2,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  alertDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  alertNeutral: {
    borderColor: "#E7E5E4",
    backgroundColor: "#FAFAF9",
  },
  alertTitleNeutral: { color: "#44403C" },
  alertDescNeutral: { color: "#78716C" },
  alertInfo: {
    borderColor: "#99F6E4",
    backgroundColor: "#F0FDFA",
  },
  alertTitleInfo: { color: "#0F766E" },
  alertDescInfo: { color: "#0D9488" },
  alertSuccess: {
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
  },
  alertTitleSuccess: { color: "#15803D" },
  alertDescSuccess: { color: "#16A34A" },
});