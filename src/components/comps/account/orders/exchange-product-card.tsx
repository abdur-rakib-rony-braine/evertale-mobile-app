import { formatCurrency } from "@/lib/format";
import { useExchangeStore } from "@/store/exchange-store";
import ImageContainer from "@/components/image-container";
import { Check, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ExchangeProductCard({ product }: { product: any }) {
  const { newProducts, addNewProduct, removeNewProduct } = useExchangeStore();

  const existingSelection = newProducts.find(
    (p) => p.productId === product._id || p._id === product._id
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(
    existingSelection?.size || null
  );

  const isSelected = !!existingSelection;
  const sizes = product.sizes || [];
  const availableSizes = sizes.filter((s: any) => s.stockQuantity > 0);
  const isOutOfStock = availableSizes.length === 0;
  const defaultColor = product.colors?.[0] || null;
  const hasDiscount = product.compareAtPrice > 0 && product.compareAtPrice !== product.price;

  const handleRemove = () => {
    if (selectedSize) {
      removeNewProduct(product._id, selectedSize);
      setSelectedSize(null);
    }
  };

  const handleSizeSelect = (size: any) => {
    const newSize = size.name;

    if (isSelected && selectedSize === newSize) {
      handleRemove();
      return;
    }

    if (isSelected && selectedSize) {
      removeNewProduct(product._id, selectedSize);
    }

    setSelectedSize(newSize);

    addNewProduct({
      _id: product._id,
      productId: product._id,
      title: product.title,
      imageUrl: product.featured_image || product.images?.[0] || "",
      handle: product.handle,
      subCategory: product.subCategory,
      quantity: 1,
      price: product.discounted_price > 0 ? product.discounted_price : product.price,
      compareAtPrice: product.compareAtPrice || 0,
      currentStock: size.stockQuantity || 0,
      size: newSize,
      color: defaultColor?.name || null,
    });
  };

  return (
    <View style={[styles.card, isSelected && styles.cardSelected]}>
      <View style={styles.imageWrap}>
        <ImageContainer
          uri={product.images?.[0] || product.featured_image}
          backgroundColor="#F2EFE9"
          placeholderText=""
        />
        {isSelected ? (
          <View style={styles.checkBadge}>
            <Check size={12} color="#FFFFFF" strokeWidth={3} />
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        {product.subCategory ? (
          <Text style={styles.subCategory}>{product.subCategory}</Text>
        ) : null}
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.price, hasDiscount && styles.priceSale]}>
            {formatCurrency(product.price)}
          </Text>
          {hasDiscount ? (
            <Text style={styles.comparePrice}>
              {formatCurrency(product.compareAtPrice)}
            </Text>
          ) : null}
        </View>

        {sizes.length > 0 ? (
          <View style={styles.sizeGrid}>
            {sizes.map((size: any, i: number) => {
              const isOOS = size.stockQuantity <= 0;
              const isActive = selectedSize === size.name && isSelected;

              return (
                <Pressable
                  key={`${size.name}-${i}`}
                  disabled={isOOS}
                  onPress={() => handleSizeSelect(size)}
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

        {isSelected ? (
          <View style={styles.selectedRow}>
            <Text style={styles.selectedText} numberOfLines={1}>
              Size {selectedSize}
              {defaultColor?.name ? ` · ${defaultColor.name}` : ""}
            </Text>
            <Pressable onPress={handleRemove} hitSlop={8} style={styles.removeBtn}>
              <X size={13} color="#DC2626" />
              <Text style={styles.removeBtnText}>Remove</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.statusBtn, isOutOfStock && styles.statusBtnDisabled]}>
            <Text style={[styles.statusText, isOutOfStock && styles.statusTextDisabled]}>
              {isOutOfStock ? "Out of Stock" : "Select a size"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F2EFE9",
    borderRadius: 8,
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: "#AE7857",
    borderWidth: 2,
  },
  imageWrap: {
    width: "100%",
    position: "relative",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#AE7857",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 10,
    gap: 6,
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
  comparePrice: {
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
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F2EFE9",
  },
  selectedText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: "#AE7857",
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  removeBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#DC2626",
  },
  statusBtn: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: "#F2EFE9",
  },
  statusBtnDisabled: {
    backgroundColor: "#F5F5F4",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    color: "#7A5C44",
    textTransform: "uppercase",
  },
  statusTextDisabled: {
    color: "#D6D3D1",
  },
});