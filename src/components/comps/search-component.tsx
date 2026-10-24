import { useRouter } from "expo-router";
import debounce from "lodash/debounce";
import { Search, X } from "lucide-react-native";
import { useCallback, useRef, useState, type ComponentRef } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { apiClient } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";

const CATEGORIES = [
  { label: "Women's", href: "/womens", image: images.womenCategory },
  { label: "Kid's", href: "/kids", image: images.kidsCategory },
];

export default function SearchComponent() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState({ products: [], total: 0 });
  const [isPending, setIsPending] = useState(false);
  
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  const fetchResults = async (query: string) => {
    try {
      setIsPending(true);
      const res = await apiClient.get(`/api/search?query=${encodeURIComponent(query)}`);
      if (res.data) {
        setResults({
          products: res.data.products || [],
          total: res.data.total || 0,
        });
      }
    } catch (error) {
      console.error("Search failed", error);
      setResults({ products: [], total: 0 });
    } finally {
      setIsPending(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.length >= 2) {
        fetchResults(query);
      } else {
        setResults({ products: [], total: 0 });
      }
    }, 300),
    []
  );

  const handleChange = (text: string) => {
    setSearchValue(text);
    debouncedSearch(text);
  };

  const handleClear = () => {
    setSearchValue("");
    setResults({ products: [], total: 0 });
    inputRef.current?.focus();
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchValue("");
    setResults({ products: [], total: 0 });
  };

  const navigateToProduct = (handle: string) => {
    handleClose();
    router.push(`/product/${handle}` as never);
  };

  const navigateToSearch = (query: string) => {
    if (!query) return;
    handleClose();
    router.push(`/search?q=${encodeURIComponent(query)}` as never);
  };

  const hasMoreProducts = results.total > results.products.length;

  return (
    <>
      <Pressable onPress={() => setIsOpen(true)} hitSlop={8}>
        <Search size={20} color="#44403C" strokeWidth={1.8} />
      </Pressable>

      <Modal visible={isOpen} animationType="slide" onRequestClose={handleClose}>
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.searchBar}>
                <Search size={18} color="#A8A29E" />
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={searchValue}
                  onChangeText={handleChange}
                  placeholder="Search products..."
                  placeholderTextColor="#A8A29E"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchValue.length > 0 && (
                  <Pressable onPress={handleClear} hitSlop={8}>
                    <X size={18} color="#A8A29E" />
                  </Pressable>
                )}
              </View>
              <Pressable onPress={handleClose} hitSlop={10}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
              {isPending && (
                <View style={styles.center}>
                  <ActivityIndicator color="#AE7857" />
                </View>
              )}

              {!isPending && results.products.length > 0 && (
                <View style={styles.resultsList}>
                  {results.products.map((product: any) => (
                    <Pressable
                      key={product._id}
                      style={styles.productRow}
                      onPress={() => navigateToProduct(product.handle)}
                    >
                      <View style={styles.productImageWrap}>
                        <Image
                          source={{ uri: product.images?.[0] }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      </View>
                      <View style={styles.productInfo}>
                        <Text style={styles.productTitle} numberOfLines={1}>
                          {product.title}
                        </Text>
                        {product.color && (
                          <Text style={styles.productColor}>{product.color}</Text>
                        )}
                        <View style={styles.priceRow}>
                          <Text style={styles.price}>
                            {formatCurrency(product.price)}
                          </Text>
                          {product.compareAtPrice > 0 && (
                            <Text style={styles.comparePrice}>
                              {formatCurrency(product.compareAtPrice)}
                            </Text>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  ))}

                  {hasMoreProducts && (
                    <Text style={styles.moreResultsText}>
                      Showing {results.products.length} of {results.total} results — try a more specific search
                    </Text>
                  )}
                </View>
              )}

              {!isPending && searchValue.length >= 2 && results.products.length === 0 && (
                <View style={styles.center}>
                  <Text style={styles.emptyText}>No products found for "{searchValue}"</Text>
                </View>
              )}

              {!isPending && searchValue.length < 2 && (
                <View style={styles.center}>
                  <Text style={styles.emptyText}>Start typing to search products</Text>
                </View>
              )}
            </ScrollView>

            {!isPending && results.products.length > 0 && (
              <View style={styles.footer}>
                <Pressable onPress={() => navigateToSearch(searchValue)}>
                  <Text style={styles.showAllText}>
                    Show all results for "{searchValue}" →
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={styles.categoriesRow}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.href}
                  style={styles.categoryCard}
                  onPress={() => {
                    handleClose();
                    router.push(cat.href as never);
                  }}
                >
                  <Image source={cat.image} style={styles.categoryImage} resizeMode="cover" />
                  <View style={styles.categoryOverlay} />
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                    <Text style={styles.categoryShop}>Shop {cat.label} →</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F4",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  input: { flex: 1, fontSize: 14, color: "#292524" },
  cancelText: { fontSize: 14, color: "#78716C" },
  scrollContent: { flexGrow: 1 },
  center: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { fontSize: 14, color: "#A8A29E" },
  resultsList: { padding: 16 },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  productImageWrap: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#F5F5F4",
    overflow: "hidden",
  },
  productImage: { width: "100%", height: "100%" },
  productInfo: { flex: 1, gap: 2 },
  productTitle: { fontSize: 14, fontWeight: "500", color: "#292524" },
  productColor: { fontSize: 12, color: "#78716C", textTransform: "capitalize" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  price: { fontSize: 14, fontWeight: "600", color: "#292524" },
  comparePrice: { fontSize: 12, color: "#A8A29E", textDecorationLine: "line-through" },
  moreResultsText: {
    fontSize: 12,
    color: "#A8A29E",
    textAlign: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    padding: 16,
    alignItems: "center",
  },
  showAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#AE7857",
    textTransform: "capitalize",
  },
  categoriesRow: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
  },
  categoryCard: {
    flex: 1,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  categoryImage: { width: "100%", height: "100%" },
  categoryOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  categoryContent: { position: "absolute", bottom: 8, left: 8 },
  categoryLabel: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  categoryShop: { color: "rgba(255,255,255,0.8)", fontSize: 10 },
});