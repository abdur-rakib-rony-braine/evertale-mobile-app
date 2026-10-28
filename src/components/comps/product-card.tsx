import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AddToCartButton from "@/components/others/add-to-cart-button";
import { Product } from "@/lib/api/products";
import { formatCurrency } from "@/lib/format";
import { productToWishlistItem } from "@/lib/wishlist-item";
import WishlistButton from "./wishlist-button";
import { Image } from "expo-image";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const router = useRouter();
  const { color } = useLocalSearchParams<{ color?: string }>();

  const [imageError, setImageError] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const primaryImage = product?.images?.[0];
  const sizes = product?.sizes || [];
  const compareAtPrice = product?.compareAtPrice || 0;

  const discountPercent =
    compareAtPrice > 0
      ? Math.round(((compareAtPrice - product.price) / compareAtPrice) * 100)
      : null;

  const isColorHighlighted = (colorName?: string) => {
    if (!color) return false;
    return (
      colorName?.toLowerCase() ===
      String(color).replace(/-/g, " ").toLowerCase()
    );
  };

  const colorHandle = (item?: { name?: string }) =>
    (product?.handle
      ? product.handle.toLowerCase().split("-").slice(0, 3).join("-")
      : "") +
    "-" +
    (item?.name ? item.name.toLowerCase().replace(/\s+/g, "-") : "");

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Pressable
          onPress={() => router.push(`/product/${product.handle}` as never)}
          style={styles.fill}
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

        {discountPercent ? (
          <View style={styles.discountWrap} pointerEvents="none">
            <Text style={styles.discountText}>Save {discountPercent}%</Text>
          </View>
        ) : null}

        <View style={styles.wishlistWrap}>
          <View style={styles.wishlistCircle}>
            <WishlistButton item={productToWishlistItem(product)} />
          </View>
        </View>

        <Pressable
          onPress={() => onQuickView?.(product)}
          style={styles.quickViewBtn}
          hitSlop={6}
          accessibilityLabel="Quick view"
        >
          <Eye size={15} color="#78716C" strokeWidth={1.8} />
        </Pressable>
      </View>

      <View style={styles.infoContainer}>
        {product?.colors?.length > 0 ? (
          <View style={styles.colorRow}>
            {product.colors.map((item, i) => {
              const highlighted = isColorHighlighted(item?.name);
              return (
                <Pressable
                  key={i}
                  onPress={() =>
                    router.push(`/product/${colorHandle(item)}` as never)
                  }
                  hitSlop={4}
                  accessibilityLabel={`View ${item?.name || "color"} variant`}
                  style={[
                    styles.colorCircle,
                    highlighted && styles.colorCircleActive,
                  ]}
                >
                  {item?.url ? (
                    <Image
                      source={{ uri: item.url }}
                      style={styles.colorImage}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Pressable
          onPress={() => router.push(`/product/${product.handle}` as never)}
        >
          <Text numberOfLines={2} style={styles.title}>
            {product?.title}
          </Text>
        </Pressable>

        <View style={styles.priceRow}>
          <Text
            style={[
              styles.priceText,
              { color: compareAtPrice > 0 ? "#AE7857" : "#2B2520" },
            ]}
          >
            {formatCurrency(product?.price)}
          </Text>
          {product?.price !== compareAtPrice && compareAtPrice > 0 ? (
            <Text style={styles.compareText}>
              {formatCurrency(compareAtPrice)}
            </Text>
          ) : null}
        </View>

        {sizes.length > 0 ? (
          <View style={styles.sizesRow}>
            {sizes.map((size, i) => {
              const isSelected = selectedSize === size.name;
              const isOOS = size.stockQuantity <= 0;

              return (
                <Pressable
                  key={`${size.name}-${i}`}
                  onPress={() => !isOOS && setSelectedSize(size.name)}
                  disabled={isOOS}
                  style={[
                    styles.sizeButton,
                    isSelected && styles.sizeButtonSelected,
                    isOOS && styles.sizeButtonOOS,
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      isSelected && styles.sizeTextSelected,
                      isOOS && styles.sizeTextOOS,
                    ]}
                  >
                    {size.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.actionWrapper}>
          {sizes.some((s) => s.stockQuantity > 0) ? (
            <AddToCartButton
              productSize={selectedSize}
              product={{
                _id: product._id,
                title: product.title,
                featured_image: product.featured_image,
                price: product.price,
                subCategory: product.subCategory,
                handle: product.handle,
                sizes: product.sizes,
              }}
            />
          ) : (
            <View style={styles.oosButton}>
              <Text style={styles.oosButtonText}>Out of Stock</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: "100%",
    height: "100%",
  },
  card: {
    width: "100%",
  },
  imageContainer: {
    aspectRatio: 3 / 4,
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#F2EFE9",
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
  discountWrap: {
    position: "absolute",
    left: 12,
    top: 12,
    backgroundColor: "#AE7857",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
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
    shadowOpacity: 0.12,
    shadowRadius: 4,
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
    gap: 8,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  colorCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    backgroundColor: "#F5F5F4",
  },
  colorCircleActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#2B2520",
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
  sizesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  sizeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  sizeButtonSelected: {
    borderColor: "#1C1917",
    borderWidth: 2,
  },
  sizeButtonOOS: {
    borderColor: "#F5F5F4",
  },
  sizeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#78716C",
  },
  sizeTextSelected: {
    color: "#1C1917",
  },
  sizeTextOOS: {
    color: "#E7E5E4",
    textDecorationLine: "line-through",
  },
  actionWrapper: {
    marginTop: 2,
  },
  oosButton: {
    width: "100%",
    height: 36,
    borderWidth: 1,
    borderColor: "#F5F5F4",
    alignItems: "center",
    justifyContent: "center",
  },
  oosButtonText: {
    color: "#D6D3D1",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "500",
  },
});