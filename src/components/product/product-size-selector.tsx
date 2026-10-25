import { Pressable, StyleSheet, Text, View } from "react-native";
import { Slash } from "lucide-react-native";
import type { Product } from "@/lib/api/products";

interface ProductSize {
  name: string;
  stockQuantity: number;
  _id?: string;
}

interface ProductSizeSelectorProps {
  product: Product;
  selectedSize: string;
  inStock: number;
  onSelect: (size: ProductSize) => void;
}

const ProductSizeSelector = ({
  product,
  selectedSize,
  inStock,
  onSelect,
}: ProductSizeSelectorProps) => {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.heading}>Size</Text>

        <View style={styles.row}>
          {product?.sizes?.map((item, i) => {
            const isSelected = selectedSize === item?.name;
            const isOOS = item?.stockQuantity === 0;

            return (
              <Pressable
                key={`${item?.name}-${i}`}
                onPress={() => onSelect(item as ProductSize)}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                  isOOS && styles.chipOOS,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                    isOOS && styles.chipTextOOS,
                  ]}
                >
                  {item?.name}
                </Text>
                {isOOS ? (
                  <View style={styles.oosOverlay} pointerEvents="none">
                    <Slash size={28} color="#E7E5E4" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      {selectedSize ? (
        <View style={styles.stockRow}>
          {inStock > 5 ? (
            <>
              <View style={[styles.dot, styles.dotGreen]} />
              <Text style={styles.stockText}>In stock — ready to ship</Text>
            </>
          ) : inStock > 0 ? (
            <>
              <View style={[styles.dot, styles.dotAmber]} />
              <Text style={styles.stockTextAmber}>Only {inStock} left</Text>
            </>
          ) : (
            <>
              <View style={[styles.dot, styles.dotRed]} />
              <Text style={styles.stockText}>Out of stock</Text>
            </>
          )}
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    paddingTop: 16,
    gap: 8,
  },
  heading: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.44,
    textTransform: "uppercase",
    color: "#78716C",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  chip: {
    position: "relative",
    minWidth: 46,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    borderWidth: 2,
    borderColor: "#1C1917",
  },
  chipOOS: {
    borderColor: "#F5F5F4",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#57534E",
    textAlign: "center",
  },
  chipTextSelected: {
    color: "#1C1917",
  },
  chipTextOOS: {
    color: "#D6D3D1",
  },
  oosOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: "#22C55E",
  },
  dotAmber: {
    backgroundColor: "#FBBF24",
  },
  dotRed: {
    backgroundColor: "#F87171",
  },
  stockText: {
    fontSize: 12,
    color: "#78716C",
  },
  stockTextAmber: {
    fontSize: 12,
    color: "#D97706",
  },
});

export default ProductSizeSelector;