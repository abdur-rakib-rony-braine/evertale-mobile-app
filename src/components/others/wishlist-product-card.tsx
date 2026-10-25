import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { X, Slash } from "lucide-react-native";

import { WishlistItem } from "@/store/wishlist-store";
import { formatCurrency } from "@/lib/format";
import AddToCartButton from "./add-to-cart-button";

interface WishlistProductCardProps {
  item: WishlistItem;
  onRemove: () => Promise<void> | void;
}

const WishlistProductCard = ({ item, onRemove }: WishlistProductCardProps) => {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);

  const availableSizes = item?.sizes?.filter((s) => s.stockQuantity > 0) || [];

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
    await onRemove();
    setIsRemoving(false);
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.push(`/product/${item.handle}` as never)}
        style={styles.imageWrapper}
      >
        <Image
          source={{ uri: item.featured_image }}
          style={styles.image}
          resizeMode="cover"
        />
      </Pressable>

      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Pressable
            onPress={() => router.push(`/product/${item.handle}` as never)}
            style={styles.titleWrapper}
          >
            {item.subCategory ? (
              <Text style={styles.subCategory}>{item.subCategory}</Text>
            ) : null}
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleRemove}
            disabled={isRemoving}
            style={styles.removeButton}
            accessibilityLabel="Remove from wishlist"
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color="#a8a29e" />
            ) : (
              <X size={14} color="#d6d3d1" />
            )}
          </Pressable>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(item?.price)}</Text>
          {item.compareAtPrice && item.compareAtPrice > 0 ? (
            <Text style={styles.comparePrice}>
              {formatCurrency(item.compareAtPrice)}
            </Text>
          ) : null}
        </View>

        {item?.sizes?.length > 0 ? (
          <View style={styles.sizesRow}>
            {item.sizes.map((size, i) => {
              const isSelected = selectedSize === size.name;
              const isOOS = size.stockQuantity === 0;

              return (
                <Pressable
                  key={`${size.name}-${i}`}
                  onPress={() => !isOOS && handleSizeSelect(size)}
                  disabled={isOOS}
                  style={[
                    styles.sizeButton,
                    isSelected
                      ? styles.sizeButtonSelected
                      : styles.sizeButtonDefault,
                    isOOS && styles.sizeButtonOOS,
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      isSelected
                        ? styles.sizeTextSelected
                        : isOOS
                        ? styles.sizeTextOOS
                        : styles.sizeTextDefault,
                    ]}
                  >
                    {size.name}
                  </Text>
                  {isOOS ? (
                    <View style={styles.oosOverlay}>
                      <Slash size={14} color="#e7e5e4" />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.actionWrapper}>
          {selectedSize && inStock > 0 ? (
            <AddToCartButton
              productSize={selectedSize}
              product={{ ...item, _id: item.productId }}
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
    paddingVertical: 20,
    paddingHorizontal: 8,
    flexDirection: "row",
    gap: 16,
  },

  imageWrapper: {
    position: "relative",
    height: 112,
    width: 96,
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: "#F5F5F4",
  },
  image: {
    height: "100%",
    width: "100%",
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
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#A8A29E",
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#292524",
    lineHeight: 18,
  },
  removeButton: {
    flexShrink: 0,
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1917",
  },
  comparePrice: {
    fontSize: 12,
    color: "#A8A29E",
    textDecorationLine: "line-through",
  },

  sizesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  sizeButton: {
    position: "relative",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  sizeButtonDefault: {
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
  },
  sizeTextDefault: {
    color: "#78716C",
  },
  sizeTextSelected: {
    color: "#1C1917",
  },
  sizeTextOOS: {
    color: "#E7E5E4",
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

  actionWrapper: {
    marginTop: 4,
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
  selectSizeButton: {
    width: "100%",
    height: 36,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    alignItems: "center",
    justifyContent: "center",
  },
  selectSizeButtonText: {
    color: "#A8A29E",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "500",
  },
});

export default WishlistProductCard;