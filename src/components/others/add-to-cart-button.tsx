import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Handbag, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { useAuthStore } from "@/store/auth-store";
import { CartItem, useCartStore } from "@/store/cart-store";
import UpdateCart from "./update-cart";
import { formatCurrency } from "@/lib/format";
import ImageContainer from "@/components/image-container";

export interface AddToCartProduct {
  _id: string;
  title: string;
  featured_image?: string;
  price: number;
  subCategory?: string;
  handle: string;
  sizes?: { name: string; stockQuantity: number }[];
}

interface AddToCartButtonProps {
  productSize: string;
  product: AddToCartProduct;
  className?: string;
  isLogo?: boolean;
}

type CartItemWithCompare = CartItem & { comparePrice?: number };

const showError = (message: string) =>
  Toast.show({ type: "error", text1: message });

const AddToCartButton = ({
  productSize,
  product,
  isLogo,
}: AddToCartButtonProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?._id ?? null);

  const cartItems = useCartStore((s) =>
    userId ? s.cartItems : s.localCart
  ) as CartItemWithCompare[];
  const totalAmount = useCartStore((s) => s.totalAmount);
  const addToCart = useCartStore((s) => s.addToCart);
  const refreshCart = useCartStore((s) => s.refreshCart);

  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setError("");

    if (!productSize) {
      setError("Please select a size");
      return;
    }

    try {
      setIsLoading(true);

      const sizeInfo = product.sizes?.find((size) => size.name === productSize);

      if (!sizeInfo || sizeInfo.stockQuantity <= 0) {
        throw new Error(`Size ${productSize} is out of stock`);
      }

      const existingCartItem = cartItems.find(
        (item) =>
          item.productId === product._id && item.productSize === productSize
      );

      if (
        existingCartItem &&
        existingCartItem.quantity >= sizeInfo.stockQuantity
      ) {
        throw new Error(
          `Sorry, we only have ${sizeInfo.stockQuantity} items in stock for size ${productSize}`
        );
      }

      const ok = await addToCart(product as never, productSize, 1, userId);
      if (ok) setOpen(true);
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Stock limit reached";
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = () => {
    router.push("/checkout" as never);
    setOpen(false);
  };

  return (
    <>
      <View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          onPress={handleAddToCart}
          disabled={isLoading}
          style={[styles.addButton, isLoading && styles.addButtonDisabled]}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.addButtonText}>Adding...</Text>
            </>
          ) : isLogo ? (
            <>
              <Handbag size={16} color="#ffffff" />
              <Text style={styles.addButtonText}>Add to cart</Text>
            </>
          ) : (
            <Text style={styles.addButtonText}>Add to cart</Text>
          )}
        </Pressable>
      </View>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Handbag size={16} color="#44403c" strokeWidth={1.8} />
              <Text style={styles.headerTitle}>
                Your Cart ({cartItems?.length || 0})
              </Text>
            </View>
            <Pressable
              onPress={() => setOpen(false)}
              style={styles.closeButton}
              accessibilityLabel="Close cart"
            >
              <X size={16} color="#a8a29e" />
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#a8a29e" />
            </View>
          ) : cartItems?.length > 0 ? (
            <View style={styles.flex1}>
              <ScrollView
                style={styles.itemsScroll}
                contentContainerStyle={styles.itemsContent}
              >
                {cartItems.map((data) => (
                  <View
                    key={`${data.productId}-${data.productSize}`}
                    style={styles.itemRow}
                  >
                    <Pressable
                      onPress={() => {
                        router.push(`/product/${data.handle}` as never);
                        setOpen(false);
                      }}
                      style={styles.itemImageWrapper}
                    >
                      <ImageContainer
                        uri={data.featured_image}
                        backgroundColor="#F2EFE9"
                        placeholderText=""
                        adaptToImage={false}
                      />
                    </Pressable>

                    <View style={styles.itemDetails}>
                      <View>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {data.title}
                        </Text>
                        <Text style={styles.itemSize}>
                          Size: {data.productSize}
                        </Text>
                        <View style={styles.itemPriceRow}>
                          <Text
                            style={[
                              styles.itemPrice,
                              data.comparePrice ? styles.itemPriceSale : null,
                            ]}
                          >
                            {formatCurrency(data.price)}
                          </Text>
                          {data.comparePrice ? (
                            <Text style={styles.itemComparePrice}>
                              {formatCurrency(data.comparePrice)}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      <UpdateCart data={data} onUpdate={refreshCart} />
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View
                style={[
                  styles.footer,
                  { paddingBottom: Math.max(insets.bottom, 12) + 8 },
                ]}
              >
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Subtotal</Text>
                  <Text style={styles.subtotalValue}>
                    {formatCurrency(totalAmount)}
                  </Text>
                </View>

                <View style={styles.footerButtons}>
                  <Pressable
                    onPress={handleCheckout}
                    style={styles.checkoutButton}
                  >
                    <Text style={styles.checkoutButtonText}>Checkout</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      router.push("/cart" as never);
                      setOpen(false);
                    }}
                    style={styles.viewCartButton}
                  >
                    <Text style={styles.viewCartButtonText}>View Cart</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setOpen(false)}
                    style={styles.continueButton}
                  >
                    <Text style={styles.continueButtonText}>
                      Continue Shopping
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.emptyContainer,
                { paddingBottom: Math.max(insets.bottom, 12) + 8 },
              ]}
            >
              <Handbag size={40} color="#e7e5e4" strokeWidth={1.5} />
              <View style={styles.emptyTextWrapper}>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptySubtitle}>
                  Looks like you haven't added anything yet.
                </Text>
              </View>
              <Pressable
                onPress={() => setOpen(false)}
                style={styles.emptyContinueButton}
              >
                <Text style={styles.emptyContinueButtonText}>
                  Continue Shopping
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1 },

  errorText: {
    paddingBottom: 8,
    fontSize: 11,
    color: "#DC2626",
  },
  addButton: {
    backgroundColor: "#AE7857",
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F5F1",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.4,
    color: "#292524",
  },
  closeButton: {
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingBox: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },

  itemsScroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  itemsContent: {
    marginTop: 16,
  },
  itemRow: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
  },
  itemImageWrapper: {
    height: 96,
    width: 80,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#F2EFE9",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2B2520",
    lineHeight: 18,
  },
  itemSize: {
    marginTop: 4,
    fontSize: 12,
    color: "#A8A29E",
    letterSpacing: 0.3,
  },
  itemPriceRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2B2520",
  },
  itemPriceSale: {
    color: "#AE7857",
  },
  itemComparePrice: {
    fontSize: 12,
    color: "#9A9187",
    textDecorationLine: "line-through",
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E7E5E4",
    backgroundColor: "#F8F5F1",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  subtotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  subtotalLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "#78716C",
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2B2520",
  },
  footerButtons: {
    flexDirection: "column",
    gap: 10,
  },
  checkoutButton: {
    height: 46,
    borderRadius: 4,
    backgroundColor: "#AE7857",
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  viewCartButton: {
    height: 46,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#2B2520",
    alignItems: "center",
    justifyContent: "center",
  },
  viewCartButtonText: {
    color: "#2B2520",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  continueButton: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 8,
  },
  continueButtonText: {
    fontSize: 12,
    color: "#78716C",
    letterSpacing: 0.3,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyTextWrapper: {
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#44403C",
    marginBottom: 4,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#A8A29E",
    textAlign: "center",
    maxWidth: 200,
  },
  emptyContinueButton: {
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#292524",
    paddingBottom: 2,
  },
  emptyContinueButtonText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#292524",
  },
});

export default AddToCartButton;