import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Tag } from "lucide-react-native";

import { apiClient } from "@/lib/api/client";
import { useExchangeStore } from "@/store/exchange-store";
import ExchangeProductCard from "@/components/comps/account/orders/exchange-product-card";

const DRESS_CATEGORIES = [
  { title: "Women Mini", value: "mini" },
  { title: "Women Midi", value: "midi" },
  { title: "Women Maxi", value: "maxi" },
  { title: "Kids Mini", value: "kid-mini" },
  { title: "Kids Midi", value: "kid-midi" },
  { title: "Kids Tops", value: "kid-tops" },
];

export default function ExchangeOrderScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  
  const { newProducts, currentOrder, setCurrentOrder } = useExchangeStore();

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(DRESS_CATEGORIES[0].value);
  const [isFetchingOrder, setIsFetchingOrder] = useState(!currentOrder);

  useEffect(() => {
    const fetchOrder = async () => {
      if (currentOrder) {
        setIsFetchingOrder(false);
        return;
      }
      try {
        const res = await apiClient.get("/api/mobile-orders");
        console.log('res.data.orders', res.data.orders)
        if (res.data?.success) {
          const order = res.data.orders.find(
            (o: any) => o.orderId === orderId || o._id === orderId
          );
          console.log('order', order)
          if (order) {
            setCurrentOrder(order);
          }
        }
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setIsFetchingOrder(false);
      }
    };
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]); // <--- Only depends on orderId

  const fetchProducts = useCallback(async (category: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/api/exchange-products?category=${category}&perPage=50`);
      if (res.data.products) {
        setProducts(res.data.products);
      }
    } catch (error) {
      console.error("Failed to load exchange products", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory, fetchProducts]);

  const handleCheckout = () => {
    router.push(`/exchange-checkout?orderId=${currentOrder?.orderId || orderId}`);
  };

  if (isFetchingOrder) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#AE7857" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <ArrowLeft size={16} color="#78716C" />
          <Text style={styles.backText}>Back to Orders</Text>
        </Pressable>
      </View>

      {newProducts.length > 0 && (
        <View style={styles.selectionBar}>
          <View style={styles.selectionInfo}>
            <View style={styles.tagIcon}>
              <Tag size={12} color="#16A34A" />
            </View>
            <Text style={styles.selectionText}>{newProducts.length} selected</Text>
          </View>
          <Pressable style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>CHECKOUT</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            <Text style={styles.title}>Choose Exchange Products</Text>
            
            <View style={styles.categoryContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.categoryScroll}
              >
                {DRESS_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.value;
                  return (
                    <Pressable
                      key={cat.value}
                      style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
                      onPress={() => setActiveCategory(cat.value)}
                    >
                      <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                        {cat.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {isLoading && (
              <ActivityIndicator style={{ marginTop: 40 }} color="#AE7857" size="large" />
            )}
          </View>
        )}
        renderItem={({ item }) => <ExchangeProductCard product={item} />}
        ListEmptyComponent={() => (
          !isLoading && <Text style={styles.emptyText}>No products found in this category.</Text>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF9" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FAFAF9" },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  backText: { fontSize: 14, color: "#78716C", fontWeight: "500" },
  selectionBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E7E5E4", marginHorizontal: 16, marginBottom: 16, padding: 12 },
  selectionInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  tagIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center" },
  selectionText: { fontSize: 13, fontWeight: "500", color: "#111827" },
  checkoutBtn: { backgroundColor: "#AE7857", paddingHorizontal: 16, paddingVertical: 8 },
  checkoutBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600", letterSpacing: 1 },
  title: { fontSize: 22, fontFamily: "Rexagus", color: "#292524", textAlign: "center", marginBottom: 20 },
  categoryContainer: { marginBottom: 20 },
  categoryScroll: { paddingHorizontal: 16, gap: 8 },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: "#E7E5E4", backgroundColor: "#FFFFFF" },
  categoryBtnActive: { backgroundColor: "#AE7857", borderColor: "#AE7857" },
  categoryText: { fontSize: 12, fontWeight: "600", color: "#78716C" },
  categoryTextActive: { color: "#FFFFFF" },
  gridContent: { paddingHorizontal: 16, paddingBottom: 40, flexGrow: 1 },
  gridRow: { justifyContent: "space-between", marginBottom: 16 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#78716C" },
});