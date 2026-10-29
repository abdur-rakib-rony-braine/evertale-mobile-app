import { Star } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SearchFiltersProps {
  activeFilters: Record<string, string>;
  onChange: (type: string, value: string) => void;
  onApply?: () => void;
  onClearAll?: () => void;
}

const PRICE_OPTIONS = [
  { label: "Low to High", value: "price" },
  { label: "High to Low", value: "-price" },
];
const RATING_OPTIONS = [5, 4, 3, 2, 1];
const TYPES = [
  { label: "Serena", value: "serena" },
  { label: "Eliora", value: "eliora" },
];
const COLORS = [
  { label: "Rose Meadow", value: "rose-meadow" },
  { label: "Midnight Navy", value: "midnight-navy" },
  { label: "Blush Pink", value: "blush-pink" },
];
const SIZES = ["XS", "S", "M", "L", "XL", "2XL"];
const FILTER_KEYS = ["price", "type", "color", "size", "rating"];

export default function Filters({
  activeFilters,
  onChange,
  onApply,
  onClearAll,
}: SearchFiltersProps) {
  const insets = useSafeAreaInsets();

  const activeCount = FILTER_KEYS.filter((k) => !!activeFilters[k]).length;

  const toggle = (type: string, value: string) => {
    onChange(type, activeFilters[type] === value ? "" : value);
  };

  const clearAll = () => {
    if (onClearAll) {
      onClearAll();
      return;
    }
    FILTER_KEYS.forEach((k) => {
      if (activeFilters[k]) onChange(k, "");
    });
  };

  const renderSection = (title: string, type: string, children: ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {activeFilters[type] ? (
          <Pressable onPress={() => onChange(type, "")} hitSlop={8}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );

  const renderRadioRow = (
    key: string,
    isActive: boolean,
    onPress: () => void,
    content: ReactNode
  ) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={[styles.row, isActive && styles.rowActive]}
    >
      <View style={[styles.radio, isActive && styles.radioActive]}>
        {isActive ? <View style={styles.radioDot} /> : null}
      </View>
      {content}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderSection(
          "Price",
          "price",
          PRICE_OPTIONS.map((opt) =>
            renderRadioRow(
              opt.value,
              activeFilters.price === opt.value,
              () => toggle("price", opt.value),
              <Text
                style={[
                  styles.rowLabel,
                  activeFilters.price === opt.value && styles.rowLabelActive,
                ]}
              >
                {opt.label}
              </Text>
            )
          )
        )}

        {renderSection(
          "Type",
          "type",
          TYPES.map((opt) =>
            renderRadioRow(
              opt.value,
              activeFilters.type === opt.value,
              () => toggle("type", opt.value),
              <Text
                style={[
                  styles.rowLabel,
                  activeFilters.type === opt.value && styles.rowLabelActive,
                ]}
              >
                {opt.label}
              </Text>
            )
          )
        )}

        {renderSection(
          "Colour",
          "color",
          COLORS.map((opt) =>
            renderRadioRow(
              opt.value,
              activeFilters.color === opt.value,
              () => toggle("color", opt.value),
              <Text
                style={[
                  styles.rowLabel,
                  activeFilters.color === opt.value && styles.rowLabelActive,
                ]}
              >
                {opt.label}
              </Text>
            )
          )
        )}

        {renderSection(
          "Size",
          "size",
          <View style={styles.sizeGrid}>
            {SIZES.map((size) => {
              const isActive = activeFilters.size === size;
              return (
                <Pressable
                  key={size}
                  style={[styles.sizeBtn, isActive && styles.sizeBtnActive]}
                  onPress={() => toggle("size", size)}
                >
                  <Text
                    style={[styles.sizeText, isActive && styles.sizeTextActive]}
                  >
                    {size}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {renderSection(
          "Rating",
          "rating",
          RATING_OPTIONS.map((rating) => {
            const isActive = activeFilters.rating === String(rating);
            return renderRadioRow(
              String(rating),
              isActive,
              () => toggle("rating", String(rating)),
              <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    color={i < rating ? "#F5B400" : "#E7E5E4"}
                    fill={i < rating ? "#F5B400" : "none"}
                  />
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      {onApply ? (
        <View
          style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}
        >
          <Pressable
            onPress={clearAll}
            disabled={activeCount === 0}
            style={[styles.clearBtn, activeCount === 0 && styles.btnDisabled]}
          >
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
          <Pressable onPress={onApply} style={styles.applyBtn}>
            <Text style={styles.applyText}>
              {activeCount > 0 ? `Apply (${activeCount})` : "Apply"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F2EFE9",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2B2520",
    letterSpacing: 0.3,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#AE7857",
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  section: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F2EFE9",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#78716C",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  resetText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#AE7857",
  },
  sectionBody: {
    gap: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: -10,
    borderRadius: 6,
  },
  rowActive: {
    backgroundColor: "#FDF8F5",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D6D3D1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: "#AE7857",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#AE7857",
  },
  rowLabel: {
    fontSize: 14,
    color: "#44403C",
  },
  rowLabelActive: {
    fontWeight: "600",
    color: "#2B2520",
  },
  sizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeBtn: {
    minWidth: 56,
    height: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  sizeBtnActive: {
    borderColor: "#AE7857",
    backgroundColor: "#AE7857",
  },
  sizeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#57534E",
  },
  sizeTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  starsRow: {
    flexDirection: "row",
    gap: 3,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F2EFE9",
  },
  clearBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#D6D3D1",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#44403C",
  },
  btnDisabled: {
    opacity: 0.4,
  },
  applyBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 6,
    backgroundColor: "#AE7857",
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#FFFFFF",
  },
});