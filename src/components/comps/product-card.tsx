import { useRouter } from "expo-router";
import { Eye } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import WishlistButton from "@/components/comps/wishlist-button";
import { Product } from "@/lib/api/products";
import { formatCurrency } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const primaryImage = product?.images?.[0];
  const displayPrice =
    product?.discounted_price && product.discounted_price > 0
      ? product.discounted_price
      : product?.price;

  const hasCompare =
    product?.compareAtPrice && product.compareAtPrice > displayPrice;

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Pressable
          onPress={() => router.push(`/product/${product.handle}` as any)}
          style={{ width: "100%", height: "100%" }}
        >
          {primaryImage && !imageError ? (
            <Image
              source={{ uri: primaryImage }}
              resizeMode="cover"
              style={styles.image}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No image</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.wishlistWrap}>
          <View style={styles.wishlistCircle}>
            <WishlistButton
              productId={product._id}
              handle={product.handle}
              subCategory={product.subCategory}
            />
          </View>
        </View>

        <Pressable
          onPress={() => onQuickView?.(product)}
          style={styles.quickViewBtn}
          hitSlop={6}
        >
          <Eye size={15} color="#78716C" strokeWidth={1.8} />
        </Pressable>
      </View>

      <View style={styles.infoContainer}>
        {product?.colors?.length > 0 ? (
          <View style={styles.colorRow}>
            {product.colors.map((color, i) => (
              <View key={i} style={styles.colorCircle}>
                {color?.url ? (
                  <Image source={{ uri: color.url }} style={styles.colorImage} />
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        <Pressable onPress={() => router.push(`/product/${product.handle}` as any)}>
          <Text numberOfLines={2} style={styles.title}>
            {product?.title}
          </Text>
        </Pressable>

        <View style={styles.priceRow}>
          <Text
            style={[
              styles.priceText,
              { color: hasCompare ? "#AE7857" : "#2b2520" },
            ]}
          >
            {formatCurrency(displayPrice)}
          </Text>
          {hasCompare ? (
            <Text style={styles.compareText}>
              {formatCurrency(product?.compareAtPrice)}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
  },
  imageContainer: {
    aspectRatio: 3 / 4,
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#F2EFE9",
    borderRadius: 8,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F4",
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: "#A8A29E",
  },
  wishlistWrap: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  wishlistCircle: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickViewBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContainer: {
    marginTop: 12,
    gap: 6,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  colorCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#F5F5F4",
  },
  colorImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 13.5,
    lineHeight: 18,
    color: "#2B2520",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceText: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  compareText: {
    fontSize: 13,
    color: "#9A9187",
    textDecorationLine: "line-through",
  },
});