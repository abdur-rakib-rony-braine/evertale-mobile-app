import { useRouter } from "expo-router";
import { Slash, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Product } from "@/lib/api/products";
import { useCartStore } from "@/store/cart-store";
import ProductViewCarousel from "./product-view-carousel";
import SoldOut from "../product/sold-out";
import { formatCurrency } from "@/lib/format";

interface QuickViewDialogProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function QuickViewDialog({
  visible,
  onClose,
  product,
}: QuickViewDialogProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addToCart = useCartStore((s) => s.addToCart);

  const [selectedSize, setSelectedSize] = useState("");
  const [inStock, setInStock] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  useEffect(() => {
    if (!visible || !product?.sizes?.length) {
      setSelectedSize("");
      setInStock(0);
      return;
    }
    const first = product.sizes[0];
    setSelectedSize(first.name);
    setInStock(first.stockQuantity);
  }, [visible, product]);

  if (!product) return null;

  const displayPrice =
    product.discounted_price && product.discounted_price > 0
      ? product.discounted_price
      : product.price;

  const handleSizeSelect = (name: string, stock: number) => {
    setSelectedSize(name);
    setInStock(stock);
  };

  const handleAddToCart = async () => {
    if (!selectedSize) return;
    setIsAddingToCart(true);
    const ok = await addToCart(product, selectedSize);
    setIsAddingToCart(false);
    if (ok) onClose();
  };

  const handleBuyNow = async () => {
    if (!selectedSize) return;
    setIsBuyingNow(true);
    const ok = await addToCart(product, selectedSize);
    setIsBuyingNow(false);
    if (ok) {
      onClose();
      router.push("/cart" as any);
    }
  };

  const isSoldOut = Boolean(selectedSize) && inStock <= 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <View style={styles.sheet}>
          <View style={styles.closeRow}>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color="#57534E" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            contentContainerStyle={{
              paddingBottom: (insets.bottom || 16) + 24,
            }}
          >
            <ProductViewCarousel images={product.images} />

            <View style={styles.content}>
              <View>
                <Text style={styles.title}>{product.title}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{formatCurrency(displayPrice)}</Text>
                  {product.compareAtPrice && product.compareAtPrice > 0 ? (
                    <Text style={styles.comparePrice}>
                      {formatCurrency(product.compareAtPrice)}
                    </Text>
                  ) : null}
                </View>
              </View>

              {product.sizes?.length > 0 ? (
                <View style={styles.divider}>
                  <Text style={styles.sectionLabel}>Size</Text>
                  <View style={styles.sizeGrid}>
                    {product.sizes.map((size, i) => {
                      const isSelected = selectedSize === size.name;
                      const isOOS = size.stockQuantity === 0;
                      return (
                        <Pressable
                          key={i}
                          onPress={() =>
                            handleSizeSelect(size.name, size.stockQuantity)
                          }
                          style={[
                            styles.sizeBtn,
                            isOOS && !isSelected && styles.sizeBtnOOS,
                            isSelected && styles.sizeBtnSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.sizeText,
                              isOOS && !isSelected && styles.sizeTextOOS,
                              isSelected && styles.sizeTextSelected,
                            ]}
                          >
                            {size.name}
                          </Text>
                          {isOOS ? (
                            <View style={styles.slashWrap}>
                              <Slash
                                size={22}
                                color={isSelected ? "#171717" : "#E7E5E4"}
                              />
                            </View>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {selectedSize ? (
                <View style={styles.stockRow}>
                  {inStock > 5 ? (
                    <>
                      <View style={[styles.stockDot, { backgroundColor: "#22C55E" }]} />
                      <Text style={styles.stockText}>In stock — ready to ship</Text>
                    </>
                  ) : inStock > 0 ? (
                    <>
                      <View style={[styles.stockDot, { backgroundColor: "#FBBF24" }]} />
                      <Text style={[styles.stockText, { color: "#D97706" }]}>
                        Only {inStock} left
                      </Text>
                    </>
                  ) : (
                    <>
                      <View style={[styles.stockDot, { backgroundColor: "#F87171" }]} />
                      <Text style={styles.stockText}>Out of stock</Text>
                    </>
                  )}
                </View>
              ) : null}

              <View style={styles.actionWrap}>
                {isSoldOut ? (
                  <SoldOut product={product} productSize={selectedSize} />
                ) : (
                  <>
                    <Pressable
                      onPress={handleAddToCart}
                      disabled={isAddingToCart || isBuyingNow || !selectedSize}
                      style={styles.addToCartBtn}
                    >
                      {isAddingToCart ? (
                        <>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text style={styles.btnText}>Adding...</Text>
                        </>
                      ) : (
                        <Text style={styles.btnText}>Add to Cart</Text>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={handleBuyNow}
                      disabled={isAddingToCart || isBuyingNow || !selectedSize}
                      style={styles.buyNowBtn}
                    >
                      {isBuyingNow ? (
                        <>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text style={styles.btnText}>Processing...</Text>
                        </>
                      ) : (
                        <Text style={styles.btnText}>Buy Now</Text>
                      )}
                    </Pressable>
                  </>
                )}

                <Pressable
                  onPress={() => {
                    onClose();
                    router.push(`/product/${product.handle}` as any);
                  }}
                  style={styles.viewDetailsBtn}
                >
                  <Text style={styles.viewDetailsText}>View Full Details</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#F8F5F1",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
  },
  closeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "#292524",
    lineHeight: 24,
    textTransform: "capitalize",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#171717",
  },
  comparePrice: {
    fontSize: 14,
    color: "#A8A29E",
    textDecorationLine: "line-through",
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#E7E5E4",
    paddingTop: 12,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.44,
    textTransform: "uppercase",
    color: "#A8A29E",
  },
  sizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeBtn: {
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 14,
    paddingVertical: 6,
    position: "relative",
  },
  sizeBtnSelected: {
    borderWidth: 2,
    borderColor: "#171717",
    backgroundColor: "#FFFFFF",
  },
  sizeBtnOOS: {
    borderColor: "#F5F5F4",
  },
  sizeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#78716C",
  },
  sizeTextSelected: {
    color: "#171717",
    fontWeight: "600",
  },
  sizeTextOOS: {
    color: "#E7E5E4",
  },
  slashWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 12,
    color: "#78716C",
  },
  actionWrap: {
    paddingTop: 8,
    gap: 8,
  },
  addToCartBtn: {
    width: "100%",
    height: 44,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buyNowBtn: {
    width: "100%",
    height: 44,
    backgroundColor: "#AE7857",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.44,
    textTransform: "uppercase",
  },
  viewDetailsBtn: {
    width: "100%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.44,
    textTransform: "uppercase",
    color: "#78716C",
  },
});