import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import ProductInfo from "@/components/product/product-info";
import Reviews from "@/components/product/reviews";
import { fetchProductByHandle, type Product } from "@/lib/api/products";
import Topbar from "@/components/comps/topbar";
import HeaderBar from "@/components/comps/header-bar";
import NewArrivals from "../comps/new-arrivals";
import BestSellers from "../comps/best-sellers";

const ProductScreen = () => {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      setError("Product not found");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const decoded = decodeURIComponent(String(slug));
      const data = await fetchProductByHandle(decoded);

      if (!data) {
        setError("Product not found");
        setProduct(null);
      } else {
        setProduct(data);
      }
    } catch {
      setError("Failed to load product");
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  if (isLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <Topbar />
        <HeaderBar />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#AE7857" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <Topbar />
        <HeaderBar />
        <View style={styles.centerContainer}>
          <Text style={styles.notFoundTitle}>Product Not Found</Text>
          <Text style={styles.notFoundBody}>
            The product you're looking for doesn't exist.
          </Text>
          <Pressable
            onPress={() => router.replace("/" as never)}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <Topbar />
      <HeaderBar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProductInfo product={product} />

        <View style={styles.separator} />

        <BestSellers />
        <NewArrivals />

        <Reviews product={product} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 32,
    marginHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1C1917",
    textAlign: "center",
  },
  notFoundBody: {
    fontSize: 14,
    color: "#78716C",
    textAlign: "center",
  },
  backButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1C1917",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "600",
    color: "#1C1917",
  },
});

export default ProductScreen;