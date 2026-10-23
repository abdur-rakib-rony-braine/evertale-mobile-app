import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Package } from "lucide-react-native";

import { apiClient } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      try {
        const res = await apiClient.get("/api/mobile-orders");
        if (!cancelled && res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (error) {
        console.log("Failed to fetch orders", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator color="#AE7857" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centerContent}>
        <Package size={40} color="#D6D3D1" />
        <Text style={styles.emptyText}>No orders found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      renderItem={({ item }) => (
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>
              Order #{item.orderId || item._id.slice(-6).toUpperCase()}
            </Text>
            <Text style={styles.orderStatus}>{item.orderStatus}</Text>
          </View>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString("en-AU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <View style={styles.orderFooter}>
            <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
            <Text style={styles.orderItems}>
              {item.orderProducts?.length || 0} items
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#A8A29E",
    marginTop: 12,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: "#E7E5E4",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
  },
  orderStatus: {
    fontSize: 11,
    color: "#AE7857",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  orderDate: {
    fontSize: 12,
    color: "#78716C",
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    paddingTop: 12,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
  },
  orderItems: {
    fontSize: 12,
    color: "#78716C",
  },
});