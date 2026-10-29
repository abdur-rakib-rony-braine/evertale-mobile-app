import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AddToCartButton from "@/components/others/add-to-cart-button";
import ImageContainer from "@/components/image-container";
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

  const [selectedSize, setSelectedSize] = useState("");

  const primaryImage = product?.images?.[0];
  const sizes = product?.sizes || [];
  const compareAtPrice = product?.compareAtPrice || 0;
  const hasDiscount = compareAtPrice > (product?.price || 0);

  const discountPercent = hasDiscount
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

  const goToProduct = () => router.push(`/product/${product.handle}` as never);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Pressable onPress={goToProduct} style={styles.fill}>
          <ImageContainer uri={primaryImage} backgroundColor="#F2EFE9" />
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

      <View style={styles.content}>
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

        {product?.subCategory ? (
          <Text style={styles.subCategory}>{product.subCategory}</Text>
        ) : null}

        <Pressable onPress={goToProduct}>
          <Text numberOfLines={2} style={styles.title}>
            {product?.title}
          </Text>
        </Pressable>

        <View style={styles.priceRow}>
          <Text style={[styles.price, hasDiscount && styles.priceSale]}>
            {formatCurrency(product?.price)}
          </Text>
          {hasDiscount ? (
            <Text style={styles.compareText}>
              {formatCurrency(compareAtPrice)}
            </Text>
          ) : null}
        </View>

        {sizes.length > 0 ? (
          <View style={styles.sizeGrid}>
            {sizes.map((size, i) => {
              const isActive = selectedSize === size.name;
              const isOOS = size.stockQuantity <= 0;

              return (
                <Pressable
                  key={`${size.name}-${i}`}
                  onPress={() => setSelectedSize(isActive ? "" : size.name)}
                  disabled={isOOS}
                  style={[
                    styles.sizeBtn,
                    isActive && styles.sizeBtnActive,
                    isOOS && styles.sizeBtnOOS,
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      isActive && styles.sizeTextActive,
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
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2EFE9",
    borderRadius: 8,
    overflow: "hidden",
  },
  imageWrap: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#F2EFE9",
    position: "relative",
  },
  discountWrap: {
    position: "absolute",
    left: 8,
    top: 8,
    backgroundColor: "#AE7857",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  wishlistWrap: {
    position: "absolute",
    right: 8,
    top: 8,
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
    bottom: 8,
    right: 8,
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
  content: {
    padding: 10,
    gap: 6,
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
  subCategory: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.2,
    color: "#A8A29E",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: "#2B2520",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2B2520",
  },
  priceSale: {
    color: "#AE7857",
  },
  compareText: {
    fontSize: 12,
    color: "#9A9187",
    textDecorationLine: "line-through",
  },
  sizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  sizeBtn: {
    minWidth: 34,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    borderRadius: 4,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  sizeBtnActive: {
    borderColor: "#AE7857",
    backgroundColor: "#AE7857",
  },
  sizeBtnOOS: {
    borderColor: "#F5F5F4",
    backgroundColor: "#FAFAF9",
  },
  sizeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#57534E",
  },
  sizeTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sizeTextOOS: {
    color: "#D6D3D1",
    textDecorationLine: "line-through",
  },
  actionWrapper: {
    marginTop: 4,
  },
  oosButton: {
    width: "100%",
    height: 36,
    borderRadius: 4,
    backgroundColor: "#F5F5F4",
    alignItems: "center",
    justifyContent: "center",
  },
  oosButtonText: {
    color: "#D6D3D1",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});