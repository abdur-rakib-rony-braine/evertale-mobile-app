import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DisplayProductsWithFilters from "@/components/comps/display-products-with-filters";
import { apiClient } from "@/lib/api/client";
import { Product } from "@/lib/api/products";
import Topbar from "@/components/comps/topbar";
import HeaderBar from "@/components/comps/header-bar";

export default function BestSellersScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();

        Object.entries(activeFilters).forEach(([k, v]) => {
          if (v) params.set(k, v);
        });

        const res = await apiClient.get(`/api/best-sellers?${params.toString()}`);

        if (res.data) {
          setProducts(res.data.products || []);
          setTotal(res.data.total || 0);
        }
      } catch (error) {
        console.error("Failed to fetch best sellers", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [activeFilters]);

  const handleFilterChange = (type: string, value: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (!value || next[type] === value) {
        delete next[type];
      } else {
        next[type] = value;
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Topbar />
      <HeaderBar />

      <DisplayProductsWithFilters
        title="Best Sellers"
        products={products}
        isLoading={isLoading}
        totalItems={total}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF9" },
});