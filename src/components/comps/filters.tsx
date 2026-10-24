import { Pressable, StyleSheet, Text, View } from "react-native";
import { Star } from "lucide-react-native";

interface SearchFiltersProps {
  activeFilters: Record<string, string>;
  onChange: (type: string, value: string) => void;
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

export default function Filters({ activeFilters, onChange }: SearchFiltersProps) {
  const renderSection = (title: string, children: React.ReactNode, type: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
      <Pressable onPress={() => onChange(type, "")} style={styles.resetBtn}>
        <Text style={styles.resetText}>Reset {title}</Text>
      </Pressable>
    </View>
  );

  const renderCheckRow = (label: string, isActive: boolean, onPress: () => void) => (
    <Pressable style={styles.checkRow} onPress={onPress}>
      <View style={[styles.checkbox, isActive && styles.checkboxActive]}>
        {isActive && <View style={styles.checkboxInner} />}
      </View>
      <Text style={[styles.checkLabel, isActive && styles.checkLabelActive]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {renderSection(
        "Price",
        PRICE_OPTIONS.map((opt) =>
          renderCheckRow(opt.label, activeFilters.price === opt.value, () => onChange("price", opt.value))
        ),
        "price"
      )}

      {renderSection(
        "Type",
        TYPES.map((type) =>
          renderCheckRow(type.label, activeFilters.type === type.value, () => onChange("type", type.value))
        ),
        "type"
      )}

      {renderSection(
        "Colour",
        COLORS.map((color) =>
          renderCheckRow(color.label, activeFilters.color === color.value, () => onChange("color", color.value))
        ),
        "color"
      )}

      {renderSection(
        "Size",
        <View style={styles.sizeGrid}>
          {SIZES.map((size) => {
            const isActive = activeFilters.size === size;
            return (
              <Pressable
                key={size}
                style={[styles.sizeBtn, isActive && styles.sizeBtnActive]}
                onPress={() => onChange("size", size)}
              >
                <Text style={[styles.sizeText, isActive && styles.sizeTextActive]}>{size}</Text>
              </Pressable>
            );
          })}
        </View>,
        "size"
      )}

      {renderSection(
        "Rating",
        RATING_OPTIONS.map((rating) => {
          const isActive = activeFilters.rating === String(rating);
          return (
            <Pressable key={rating} style={styles.checkRow} onPress={() => onChange("rating", String(rating))}>
              <View style={[styles.checkbox, isActive && styles.checkboxActive]}>
                {isActive && <View style={styles.checkboxInner} />}
              </View>
              <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} color={i < rating ? "#FFC300" : "#E7E5E4"} fill={i < rating ? "#FFC300" : "none"} />
                ))}
              </View>
            </Pressable>
          );
        }),
        "rating"
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 24 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 12, fontWeight: "600", color: "#78716C", textTransform: "uppercase", letterSpacing: 1.5 },
  sectionBody: { gap: 10 },
  resetBtn: { paddingTop: 4 },
  resetText: { fontSize: 11, color: "#A8A29E" },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: "#D6D3D1", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  checkboxActive: { borderColor: "#AE7857", backgroundColor: "#AE7857" },
  checkboxInner: { width: 8, height: 8, backgroundColor: "#FFFFFF" },
  checkLabel: { fontSize: 13, color: "#44403C" },
  checkLabelActive: { fontWeight: "600", color: "#292524" },
  sizeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sizeBtn: { width: 52, height: 36, borderWidth: 1, borderColor: "#E7E5E4", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  sizeBtnActive: { borderColor: "#AE7857", backgroundColor: "#FDF8F5", borderWidth: 2 },
  sizeText: { fontSize: 12, color: "#78716C" },
  sizeTextActive: { color: "#AE7857", fontWeight: "600" },
  starsRow: { flexDirection: "row", gap: 2 },
});