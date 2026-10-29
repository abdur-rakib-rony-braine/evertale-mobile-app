import { SlidersHorizontal, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import ProductCard from "@/components/comps/product-card";
import { Product } from "@/lib/api/products";
import DressCategories from "./dress-categories";
import Filters from "./filters";
import SearchPromoBanner from "./search-promo-banner";

const { width } = Dimensions.get("window");
const CARD_GAP = 4;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

interface DisplayProductsWithFiltersProps {
  title: string;
  products: Product[];
  isLoading?: boolean;
  dressCategoryOptions?: { title: string; value: string }[];
  totalItems?: number;
  query?: string;
  activeCategory?: string | null;
  onCategoryChange?: (val: string) => void;
  activeFilters?: Record<string, string>;
  onFilterChange?: (type: string, val: string) => void;
  onClearFilters?: () => void;
}

interface FilterSheetProps {
  activeFilters: Record<string, string>;
  onFilterChange?: (type: string, val: string) => void;
  onClearFilters?: () => void;
  onClose: () => void;
}

function FilterSheet({
  activeFilters,
  onFilterChange,
  onClearFilters,
  onClose,
}: FilterSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.modalBackdrop}>
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filters</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={20} color="#78716C" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Filters
            activeFilters={activeFilters}
            onChange={(type, value) => onFilterChange?.(type, value)}
          />
        </ScrollView>

        <View
          style={[
            styles.modalFooter,
            { paddingBottom: Math.max(insets.bottom, 12) + 8 },
          ]}
        >
          <Pressable style={styles.clearFiltersBtn} onPress={onClearFilters}>
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </Pressable>
          <Pressable style={styles.applyBtn} onPress={onClose}>
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function DisplayProductsWithFilters({
  title,
  products,
  isLoading = false,
  dressCategoryOptions,
  totalItems = 0,
  query = "",
  activeCategory,
  onCategoryChange,
  activeFilters = {},
  onFilterChange,
  onClearFilters,
}: DisplayProductsWithFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterCount =
    Object.keys(activeFilters).filter((k) => activeFilters[k]).length +
    (activeCategory ? 1 : 0);

  return (
    <View style={styles.container}>
      {query ? (
        <SearchPromoBanner title={title} query={query} />
      ) : (
        <View style={styles.standardBanner}>
          <Text style={styles.standardTitle}>{title}</Text>
        </View>
      )}

      <View style={styles.controls}>
        <Pressable style={styles.filterBtn} onPress={() => setIsFilterOpen(true)}>
          <SlidersHorizontal size={14} color="#7A5C44" />
          <Text style={styles.filterBtnText}>Filters</Text>
          {filterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </Pressable>

        {dressCategoryOptions && dressCategoryOptions.length > 0 && (
          <View style={styles.categoriesContainer}>
            <DressCategories
              options={dressCategoryOptions}
              activeCategory={activeCategory || null}
              onChange={(val) => onCategoryChange?.(val)}
            />
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#AE7857" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No products found.</Text>
          {filterCount > 0 && (
            <Pressable style={styles.clearBtn} onPress={onClearFilters}>
              <Text style={styles.clearBtnText}>Clear Filters</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => item._id || String(index)}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <Text style={styles.resultCount}>
              {totalItems} {totalItems === 1 ? "result" : "results"} found
            </Text>
          )}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH }}>
              <ProductCard product={item} />
            </View>
          )}
        />
      )}

      <Modal
        visible={isFilterOpen}
        animationType="slide"
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setIsFilterOpen(false)}
      >
        <SafeAreaProvider>
          <FilterSheet
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            onClose={() => setIsFilterOpen(false)}
          />
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF9" },
  standardBanner: {
    paddingVertical: 24,
    alignItems: "center",
    backgroundColor: "#F0ECE6",
  },
  standardTitle: {
    fontSize: 24,
    fontFamily: "Rexagus",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#2C1A10",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#C4B49A",
    backgroundColor: "#FFFFFF",
  },
  filterBtnText: { fontSize: 12, color: "#2C1A10", fontWeight: "500" },
  filterBadge: {
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    backgroundColor: "#7A5C44",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { fontSize: 9, color: "#FFFFFF", fontWeight: "bold" },
  categoriesContainer: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 14, color: "#A8A29E" },
  clearBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#AE7857",
  },
  clearBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  gridContent: { padding: 16, paddingBottom: 40 },
  gridRow: { justifyContent: "space-between", gap: CARD_GAP, marginBottom: CARD_GAP },
  resultCount: { fontSize: 12, color: "#78716C", marginBottom: 12 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F5F5F4" },
  modalTitle: { fontSize: 16, fontWeight: "600", color: "#292524" },
  modalFooter: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F5F5F4" },
  clearFiltersBtn: { flex: 1, height: 44, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E7E5E4" },
  clearFiltersText: { fontSize: 12, fontWeight: "600", color: "#78716C" },
  applyBtn: { flex: 1, height: 44, justifyContent: "center", alignItems: "center", backgroundColor: "#AE7857" },
  applyBtnText: { fontSize: 12, fontWeight: "600", color: "#FFFFFF" },
});