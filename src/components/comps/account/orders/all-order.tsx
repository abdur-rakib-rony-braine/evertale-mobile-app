import { useRouter } from "expo-router";
import { ChevronDown, Package, Search, X } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import OrderCard from "./order-card";
import {
  FILTER_OPTIONS,
  FilterValue,
  ORDERS_PER_PAGE,
  matchesFilter,
  matchesSearch,
} from "./order-utils";

interface AllOrderProps {
  initialOrders: any[];
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function AllOrder({
  initialOrders,
  refreshing,
  onRefresh,
}: AllOrderProps) {
  const router = useRouter(); // <--- Initialize router
  const listRef = useRef<FlatList>(null);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const searchedOrders = useMemo(
    () =>
      (initialOrders || []).filter(
        (order) => matchesFilter(order, filter) && matchesSearch(order, searchTerm)
      ),
    [initialOrders, filter, searchTerm]
  );

  const totalOrders = searchedOrders.length;
  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);
  const paginatedOrders = searchedOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleOrderPress = (order: any) => {
    // Navigate to the order details screen using the _id
    router.push(`/order/${order._id}` as never);
  };

  const filterLabel = FILTER_OPTIONS.find((o) => o.value === filter)?.label;
  const isFiltered = !!searchTerm || filter !== "all";

  const header = (
    <View style={styles.header}>
      <View style={styles.searchBox}>
        <Search size={14} color="#A8A29E" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search by order ID or product…"
          placeholderTextColor="#A8A29E"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchTerm ? (
          <Pressable onPress={() => setSearchTerm("")} hitSlop={8}>
            <X size={14} color="#A8A29E" />
          </Pressable>
        ) : null}
      </View>

      <Pressable style={styles.selectBtn} onPress={() => setShowFilter(true)}>
        <Text style={styles.selectText}>{filterLabel}</Text>
        <ChevronDown size={18} color="#78716C" />
      </Pressable>

      {totalOrders > 0 ? (
        <Text style={styles.count}>
          {totalOrders} {totalOrders === 1 ? "order" : "orders"}
          {isFiltered ? " found" : ""}
        </Text>
      ) : null}
    </View>
  );

  const footer =
    totalPages > 1 ? (
      <View style={styles.pagination}>
        <Pressable
          style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
          onPress={() => goToPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <Text style={styles.pageText}>‹</Text>
        </Pressable>
        {Array.from({ length: totalPages }).map((_, i) => (
          <Pressable
            key={i}
            style={[styles.pageBtn, currentPage === i + 1 && styles.pageBtnActive]}
            onPress={() => goToPage(i + 1)}
          >
            <Text
              style={[styles.pageText, currentPage === i + 1 && styles.pageTextActive]}
            >
              {i + 1}
            </Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
          onPress={() => goToPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.pageText}>›</Text>
        </Pressable>
      </View>
    ) : null;

  const empty = (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Package size={28} color="#D6D3D1" strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle}>No orders found</Text>
      <Text style={styles.emptyDesc}>
        {isFiltered
          ? "Try adjusting your search or filter"
          : "You haven't placed any orders yet — start exploring"}
      </Text>
      {!isFiltered ? (
        <Pressable style={styles.shopBtn} onPress={() => router.push("/")}>
          <Text style={styles.shopBtnText}>CONTINUE SHOPPING</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <>
      <FlatList
        ref={listRef}
        data={paginatedOrders}
        keyExtractor={(item, index) => String(item._id || item.id || index)}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={handleOrderPress} />
        )}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ListEmptyComponent={empty}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      <Modal
        visible={showFilter}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilter(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowFilter(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Orders</Text>
              <Pressable onPress={() => setShowFilter(false)} hitSlop={10}>
                <X size={20} color="#78716C" />
              </Pressable>
            </View>
            {FILTER_OPTIONS.map((o) => (
              <Pressable
                key={o.value}
                style={[styles.modalItem, filter === o.value && styles.modalItemActive]}
                onPress={() => {
                  setFilter(o.value);
                  setShowFilter(false);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    filter === o.value && styles.modalItemTextActive,
                  ]}
                >
                  {o.label}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16, paddingBottom: 40, flexGrow: 1 },
  header: { gap: 12, marginBottom: 20 },
  searchBox: {
    height: 40,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#292524", height: "100%" },
  selectBtn: {
    height: 40,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { fontSize: 14, color: "#292524" },
  count: { fontSize: 12, color: "#A8A29E" },
  pagination: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    paddingTop: 24,
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    alignItems: "center",
    justifyContent: "center",
  },
  pageBtnActive: { backgroundColor: "#1C1917", borderColor: "#1C1917" },
  pageBtnDisabled: { opacity: 0.3 },
  pageText: { fontSize: 12, fontWeight: "600", color: "#78716C" },
  pageTextActive: { color: "#FFFFFF" },
  empty: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    paddingVertical: 56,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F5F5F4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 14, fontWeight: "600", color: "#44403C", marginBottom: 4 },
  emptyDesc: { fontSize: 12, color: "#A8A29E", textAlign: "center", marginBottom: 24 },
  shopBtn: {
    borderWidth: 1,
    borderColor: "#292524",
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  shopBtnText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "#292524",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  modalTitle: { fontSize: 16, fontWeight: "600", color: "#292524" },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  modalItemActive: { backgroundColor: "#FDF8F5" },
  modalItemText: { fontSize: 15, color: "#44403C" },
  modalItemTextActive: { color: "#AE7857", fontWeight: "600" },
});