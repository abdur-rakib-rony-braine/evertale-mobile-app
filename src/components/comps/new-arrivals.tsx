import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Product, fetchNewArrivals } from "@/lib/api/products";
import ProductCard from "./product-card";
import QuickViewDialog from "./quick-view-dialog";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export default function NewArrivals() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchNewArrivals();
        if (!cancelled) setProducts(data);
      } catch {
        if (!cancelled) setProducts([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
  }, []);

  if (products === null) return null;
  if (!products.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.subtitle}>
            A new expression of effortless luxury
          </Text>
          <Text style={styles.title}>New Arrivals</Text>
        </View>

        <Pressable
          onPress={() => router.push("/new-arrivals" as any)}
          style={styles.seeAllBtn}
        >
          <Text style={styles.seeAllText}>See All</Text>
        </Pressable>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item, index) => item._id ?? String(index)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <ProductCard product={item} onQuickView={handleQuickView} />
          </View>
        )}
      />

      <QuickViewDialog
        visible={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
  },
  headerRow: {
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  headerLeft: {
    flex: 1,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: "#A8A29E",
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: "Rexagus",
    color: "#262626",
    lineHeight: 28,
  },
  seeAllBtn: {
    borderWidth: 1,
    borderColor: "#D6D3D1",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#44403C",
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },
});