import { StyleSheet, Text, View } from "react-native";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Repeat,
  ArrowLeft,
  Pause,
} from "lucide-react-native";

interface OrderStatusProps {
  status: string;
}

export default function OrderStatus({ status }: OrderStatusProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Unfulfilled":
        return {
          icon: <Clock size={14} color="#EA580C" />,
          color: "#C2410C",
          bg: "#FFF7ED",
          border: "#FED7AA",
        };
      case "Canceled":
        return {
          icon: <XCircle size={14} color="#DC2626" />,
          color: "#B91C1C",
          bg: "#FEF2F2",
          border: "#FECACA",
        };
      case "Fulfilled":
        return {
          icon: <Truck size={14} color="#2563EB" />,
          color: "#1D4ED8",
          bg: "#EFF6FF",
          border: "#BFDBFE",
        };
      case "Delivered":
        return {
          icon: <CheckCircle size={14} color="#16A34A" />,
          color: "#15803D",
          bg: "#F0FDF4",
          border: "#BBF7D0",
        };
      case "Exchange Requested":
      case "Exchange In Progress":
        return {
          icon: <Repeat size={14} color="#7C3AED" />,
          color: "#6D28D9",
          bg: "#F5F3FF",
          border: "#DDD6FE",
        };
      case "Exchanged":
        return {
          icon: <Repeat size={14} color="#059669" />,
          color: "#047857",
          bg: "#ECFDF5",
          border: "#A7F3D0",
        };
      case "Return Requested":
      case "Return In Progress":
        return {
          icon: <RefreshCw size={14} color="#9333EA" />,
          color: "#7E22CE",
          bg: "#FAF5FF",
          border: "#E9D5FF",
        };
      case "Returned":
        return {
          icon: <ArrowLeft size={14} color="#D97706" />,
          color: "#B45309",
          bg: "#FFFBEB",
          border: "#FDE68A",
        };
      case "Partially Refunded":
        return {
          icon: <RefreshCw size={14} color="#0D9488" />,
          color: "#0F766E",
          bg: "#F0FDFA",
          border: "#99F6E4",
        };
      case "Refunded":
        return {
          icon: <RefreshCw size={14} color="#059669" />,
          color: "#047857",
          bg: "#ECFDF5",
          border: "#A7F3D0",
        };
      case "On Hold":
        return {
          icon: <Pause size={14} color="#6B7280" />,
          color: "#4B5563",
          bg: "#F9FAFB",
          border: "#E5E7EB",
        };
      default:
        return {
          icon: <Package size={14} color="#6B7280" />,
          color: "#4B5563",
          bg: "#F3F4F6",
          border: "#E5E7EB",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      {config.icon}
      <Text style={[styles.text, { color: config.color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "capitalize",
  },
});