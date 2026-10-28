import { formatCurrency } from "@/lib/format";
import { useExchangeStore } from "@/store/exchange-store";
import { Image } from "expo-image";
import { Slash, X } from "lucide-react-native";
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
  const availableSizes = product.sizes?.filter((s: any) => s.stockQuantity > 0) || [];
  const isOutOfStock = availableSizes.length === 0;
  const defaultColor = product.colors?.[0] || null;

  const handleSizeSelect = (size: any) => {
    const newSize = size.name;
    
    if (isSelected && selectedSize && selectedSize !== newSize) {
      removeNewProduct(product._id, selectedSize);
    }

    setSelectedSize(newSize);

    const transformedProduct = {
      _id: product._id,
      productId: product._id,
      title: product.title,
      imageUrl: product.featured_image || product.images?.[0] || "",
      handle: product.handle,
      subCategory: product.subCategory,
      quantity: 1,
      price: product.discounted_price > 0 ? product.discounted_price : product.price,
      compareAtPrice: product.compareAtPrice || 0,
      currentStock: product.sizes?.find((s: any) => s.name === newSize)?.stockQuantity || 0,
      size: newSize,
      color: defaultColor?.name || null,
    };
    
    addNewProduct(transformedProduct);
  };

  const handleRemove = () => {
    if (selectedSize) {
      removeNewProduct(product._id, selectedSize);
      setSelectedSize(null);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images?.[0] || "https://placehold.co/400" }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        {product.subCategory && (
          <Text style={styles.subCategory}>{product.subCategory}</Text>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          {product.compareAtPrice > 0 && (
            <Text style={styles.comparePrice}>{formatCurrency(product.compareAtPrice)}</Text>
          )}
        </View>

        {isSelected && (
          <View style={styles.selectionBox}>
            <Text style={styles.selectionTitle}>Currently Selected:</Text>
            <Text style={styles.selectionText}>Size: {selectedSize}</Text>
            {defaultColor && <Text style={styles.selectionText}>Color: {defaultColor.name}</Text>}
          </View>
        )}

        {availableSizes.length > 0 && !isSelected && (
          <View style={styles.sizesContainer}>
            <Text style={styles.sizeLabel}>Select a Size</Text>
            <View style={styles.sizeGrid}>
              {product.sizes.map((size: any, i: number) => {
                const isOOS = size.stockQuantity === 0;
                const isActive = selectedSize === size.name;

                return (
                  <Pressable
                    key={i}
                    disabled={isOOS}
                    onPress={() => handleSizeSelect(size)}
                    style={[
                      styles.sizeBtn,
                      isActive && styles.sizeBtnActive,
                      isOOS && styles.sizeBtnOOS,
                    ]}
                  >
                    <Text style={[
                      styles.sizeText,
                      isActive && styles.sizeTextActive,
                      isOOS && styles.sizeTextOOS,
                    ]}>
                      {size.name}
                    </Text>
                    {isOOS && (
                      <View style={styles.slashIcon}>
                        <Slash size={14} color="#D6D3D1" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {isSelected ? (
          <Pressable style={styles.removeBtn} onPress={handleRemove}>
            <X size={14} color="#DC2626" />
            <Text style={styles.removeBtnText}>Remove Selection</Text>
          </Pressable>
        ) : (
          <View style={[styles.selectBtn, (!selectedSize || isOutOfStock) && styles.selectBtnDisabled]}>
            <Text style={styles.selectBtnText}>
              {isOutOfStock ? "Out of Stock" : !selectedSize ? "Select a size" : "Select for Exchange"}
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
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: "#F8F8F8",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  content: { paddingVertical: 12, gap: 4 },
  title: { fontSize: 13, fontWeight: "500", color: "#292524" },
  subCategory: { fontSize: 11, color: "#78716C", textTransform: "uppercase" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  price: { fontSize: 16, fontWeight: "700", color: "#292524" },
  comparePrice: { fontSize: 12, color: "#A8A29E", textDecorationLine: "line-through" },
  selectionBox: { backgroundColor: "#EFF6FF", padding: 8, marginTop: 4 },
  selectionTitle: { fontSize: 11, fontWeight: "600", color: "#1D4ED8" },
  selectionText: { fontSize: 11, color: "#2563EB" },
  sizesContainer: { marginTop: 8 },
  sizeLabel: { fontSize: 11, fontWeight: "600", color: "#292524", marginBottom: 4 },
  sizeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  sizeBtn: {
    borderWidth: 1, borderColor: "#E7E5E4", paddingHorizontal: 8, paddingVertical: 4,
    position: "relative",
  },
  sizeBtnActive: { borderColor: "#3B82F6", backgroundColor: "#EFF6FF", borderWidth: 2 },
  sizeBtnOOS: { borderColor: "#F5F5F4" },
  sizeText: { fontSize: 11, color: "#78716C" },
  sizeTextActive: { color: "#1D4ED8", fontWeight: "600" },
  sizeTextOOS: { color: "#D6D3D1" },
  slashIcon: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  removeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "#FEF2F2", paddingVertical: 8, marginTop: 8, borderWidth: 1, borderColor: "#FECACA",
  },
  removeBtnText: { fontSize: 11, fontWeight: "600", color: "#DC2626" },
  selectBtn: {
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#AE7857", paddingVertical: 8, marginTop: 8,
  },
  selectBtnDisabled: { backgroundColor: "#D6D3D1" },
  selectBtnText: { fontSize: 11, fontWeight: "600", color: "#FFFFFF" },
});