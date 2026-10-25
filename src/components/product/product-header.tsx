import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Product } from "@/lib/api/products";
import StarRating from "./star-rating";

interface ProductHeaderProps {
  product: Product;
  onReviewClick?: () => void;
}

const ProductHeader = ({ product, onReviewClick }: ProductHeaderProps) => {
  return (
    <>
      <Text style={styles.title}>{product?.title}</Text>

      <View style={styles.metaRow}>
        <View style={styles.ratingRow}>
          <StarRating rate={product?.rating || 0} />
          <Pressable onPress={onReviewClick} hitSlop={6}>
            <Text style={styles.reviewLink}>
              {product?.reviews?.length || 0} reviews
            </Text>
          </Pressable>
        </View>

        <Text style={styles.divider}>|</Text>

        <Text style={styles.skuText}>
          <Text style={styles.skuLabel}>SKU:</Text>{" "}
          {product?.barcode || "N/A"}
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "500",
    textTransform: "capitalize",
    lineHeight: 30,
    color: "#1C1917",
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reviewLink: {
    fontSize: 12,
    color: "#A8A29E",
    textDecorationLine: "underline",
  },
  divider: {
    fontSize: 14,
    color: "#E7E5E4",
  },
  skuText: {
    fontSize: 12,
    color: "#A8A29E",
  },
  skuLabel: {
    fontWeight: "500",
    color: "#57534E",
  },
});

export default ProductHeader;