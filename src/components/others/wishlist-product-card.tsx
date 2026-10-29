import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";

import { WishlistItem } from "@/store/wishlist-store";
import { formatCurrency } from "@/lib/format";
import ImageContainer from "@/components/image-container";
import AddToCartButton from "./add-to-cart-button";

interface WishlistProductCardProps {
  item: WishlistItem;
  onRemove: () => Promise<void> | void;
}

const WishlistProductCard = ({ item, onRemove }: WishlistProductCardProps) => {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);

  const sizes = Array.isArray(item?.sizes) ? item.sizes : [];
  const availableSizes = sizes.filter((s) => (s?.stockQuantity ?? 0) > 0);
  const price = Number(item?.price) || 0;
  const compareAtPrice = Number(item?.compareAtPrice) || 0;
  const hasDiscount = compareAtPrice > price;

  const [selectedSize, setSelectedSize] = useState(
    availableSizes[0]?.name || ""
  );
  const [inStock, setInStock] = useState(availableSizes[0]?.stockQuantity || 0);

  const handleSizeSelect = (size: { name: string; stockQuantity: number }) => {
    setSelectedSize(size.name);
    setInStock(size.stockQuantity);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove();
    } finally {
      setIsRemoving(false);
    }
  };

  const openProduct = () => {
    if (!item?.handle) return;
    router.push(`/product/${item.handle}` as never);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={openProduct} style={styles.imageWrapper}>
        <ImageContainer
          uri={item?.featured_image}
          backgroundColor="#F2EFE9"
          placeholderText=""
          fallbackAspectRatio={6 / 7}
        />
      </Pressable>

      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Pressable onPress={openProduct} style={styles.titleWrapper}>
            {item?.subCategory ? (
              <Text style={styles.subCategory}>{item.subCategory}</Text>
            ) : null}
            <Text style={styles.title} numberOfLines={2}>
              {item?.title ?? ""}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleRemove}
            disabled={isRemoving}
            hitSlop={6}
            style={styles.removeButton}
            accessibilityLabel="Remove from wishlist"
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color="#AE7857" />
            ) : (
              <X size={14} color="#78716C" strokeWidth={2} />
            )}
          </Pressable>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.price, hasDiscount && styles.priceSale]}>
            {formatCurrency(price)}
          </Text>
          {hasDiscount ? (
            <Text style={styles.comparePrice}>
              {formatCurrency(compareAtPrice)}
            </Text>
          ) : null}
        </View>

        {sizes.length > 0 ? (
          <View style={styles.sizesRow}>
            {sizes.map((size, i) => {
              const isSelected = selectedSize === size.name;
              const isOOS = (size.stockQuantity ?? 0) === 0;

              return (
                <Pressable
                  key={`${size.name}-${i}`}
                  onPress={() => !isOOS && handleSizeSelect(size)}
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
          {selectedSize && inStock > 0 ? (
            <AddToCartButton
              productSize={selectedSize}
              product={{ ...item, _id: item.productId, sizes }}
            />
          ) : availableSizes.length === 0 ? (
            <View style={styles.oosButton}>
              <Text style={styles.oosButtonText}>Out of Stock</Text>
            </View>
          ) : (
            <View style={styles.selectSizeButton}>
              <Text style={styles.selectSizeButtonText}>Select a Size</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2EFE9",
    borderRadius: 8,
  },

  imageWrapper: {
    width: 96,
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#F2EFE9",
  },

  details: {
    flex: 1,
    flexDirection: "column",
    gap: 8,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  titleWrapper: {
    flex: 1,
    minWidth: 0,
  },
  subCategory: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#A8A29E",
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2B2520",
    lineHeight: 18,
  },
  removeButton: {
    flexShrink: 0,
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F2EFE9",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
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
  comparePrice: {
    fontSize: 12,
    color: "#9A9187",
    textDecorationLine: "line-through",
  },

  sizesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  sizeButton: {
    minWidth: 34,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  sizeButtonSelected: {
    borderColor: "#AE7857",
    backgroundColor: "#AE7857",
  },
  sizeButtonOOS: {
    borderColor: "#F5F5F4",
    backgroundColor: "#FAFAF9",
  },
  sizeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#57534E",
  },
  sizeTextSelected: {
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
  selectSizeButton: {
    width: "100%",
    height: 36,
    borderRadius: 4,
    backgroundColor: "#F2EFE9",
    alignItems: "center",
    justifyContent: "center",
  },
  selectSizeButtonText: {
    color: "#7A5C44",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});

export default WishlistProductCard;