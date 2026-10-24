import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

import DisplayProductsWithFilters from "@/components/comps/display-products-with-filters";
import { apiClient } from "@/lib/api/client";
import { Product } from "@/lib/api/products";
import Topbar from "@/components/comps/topbar";
import HeaderBar from "@/components/comps/header-bar";

const CATEGORY_CONFIG: Record<string, { label: string; apiValue: string }> = {
  "mini-dress": { label: "Mini Dress", apiValue: "mini" },
  "midi-dress": { label: "Midi Dress", apiValue: "midi" },
  "maxi-dress": { label: "Maxi Dress", apiValue: "maxi" },
};

const DRESS_CATEGORIES = [
  { title: "Mini", value: "mini" },
  { title: "Midi", value: "midi" },
  { title: "Maxi", value: "maxi" },
];

export default function WomensCategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  
  const config = CATEGORY_CONFIG[category as string];

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string | null>(config?.apiValue || null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!config) {
      router.replace("/womens");
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("category", "women");
        params.set("subCategory", activeCategory || config.apiValue);
        
        Object.entries(activeFilters).forEach(([k, v]) => {
          if (v) params.set(k, v);
        });

        const res = await apiClient.get(`/api/women?${params.toString()}`);
        if (res.data) {
          setProducts(res.data.products || []);
          setTotal(res.data.total || 0);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [config, activeCategory, activeFilters, router]);

  if (!config) {
    return null;
  }

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

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
    router.setParams({ category: `${value}-dress` });
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Topbar />
      <HeaderBar />

      <DisplayProductsWithFilters
        title={`Women's ${config.label}`}
        products={products}
        isLoading={isLoading}
        totalItems={total}
        dressCategoryOptions={DRESS_CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
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