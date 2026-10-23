import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { RefreshCw } from "lucide-react-native";

import { apiClient } from "@/lib/api/client";
import AllOrder from "./orders/all-order";

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/mobile-orders");
      if (res.data?.success) {
        setOrders(res.data.orders || []);
        setHasError(false);
      } else {
        setHasError(true);
      }
    } catch {
      setHasError(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetchOrders();
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const retry = async () => {
    setIsLoading(true);
    await fetchOrders();
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator color="#AE7857" />
      </View>
    );
  }

  if (hasError && orders.length === 0) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorText}>Failed to load orders.</Text>
        <Pressable style={styles.retryBtn} onPress={retry}>
          <RefreshCw size={14} color="#FFFFFF" />
          <Text style={styles.retryText}>RETRY</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AllOrder initialOrders={orders} refreshing={refreshing} onRefresh={onRefresh} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF9" },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: { fontSize: 14, color: "#A8A29E" },
  retryBtn: {
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: "#AE7857",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  retryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600", letterSpacing: 1.5 },
});










// ............WEB VIEW CODE IMPORTANT FOR REFERENCE..............
// import { useRef, useState } from "react";
// import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
// import { WebView } from "react-native-webview";
// import { RefreshCw } from "lucide-react-native";

// import { urls } from "@/constants/url";
// import { useAuthStore } from "@/store/auth-store";

// export default function OrdersTab() {
//   const token = useAuthStore((s) => s.token);
//   const webRef = useRef<WebView>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [hasError, setHasError] = useState(false);

//   const uri = `${urls.api.base}/api/mobile-web-login?next=${encodeURIComponent("/account/orders")}`;

//   const retry = () => {
//     setHasError(false);
//     setIsLoading(true);
//     webRef.current?.reload();
//   };

//   if (hasError) {
//     return (
//       <View style={styles.centerContent}>
//         <Text style={styles.errorText}>Failed to load orders.</Text>
//         <Pressable style={styles.retryBtn} onPress={retry}>
//           <RefreshCw size={14} color="#FFFFFF" />
//           <Text style={styles.retryText}>RETRY</Text>
//         </Pressable>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <WebView
//         ref={webRef}
//         source={{ uri, headers: { Authorization: `Bearer ${token}` } }}
//         style={styles.webview}
//         incognito
//         domStorageEnabled
//         javaScriptEnabled
//         pullToRefreshEnabled
//         startInLoadingState={false}
//         onLoadStart={() => setIsLoading(true)}
//         onLoadEnd={() => setIsLoading(false)}
//         onNavigationStateChange={(nav) => console.log("webview nav", nav.url)}
//         onError={(e) => {
//           console.log("webview error", e.nativeEvent);
//           setHasError(true);
//         }}
//         onHttpError={(e) => {
//           const { statusCode, url } = e.nativeEvent;
//           console.log("webview http error", statusCode, url);
//           const isMain = url.includes("/api/mobile-web-login") || url.includes("/account/orders");
//           if (isMain && statusCode >= 400) setHasError(true);
//         }}
//       />
//       {isLoading ? (
//         <View style={styles.loader} pointerEvents="none">
//           <ActivityIndicator color="#AE7857" />
//         </View>
//       ) : null}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FFFFFF" },
//   webview: { flex: 1, backgroundColor: "#FFFFFF" },
//   loader: {
//     ...StyleSheet.absoluteFill,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#FFFFFF",
//   },
//   centerContent: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 12,
//   },
//   errorText: { fontSize: 14, color: "#A8A29E" },
//   retryBtn: {
//     height: 40,
//     paddingHorizontal: 20,
//     backgroundColor: "#AE7857",
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   retryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600", letterSpacing: 1.5 },
// });
