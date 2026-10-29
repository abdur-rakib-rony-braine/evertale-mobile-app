import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "@/lib/format";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { CartLineItem } from "@/types/cart";
import ImageContainer from "@/components/image-container";
import PriceUpdateAlert from "./price-update-alert";
import RemoveFromCart from "./remove-from-cart";
import SizeSelector from "./size-selector";
import UpdateQuantity from "./update-quantity";
import { cartItemToWishlistItem } from "@/lib/wishlist-item";
import WishlistButton from "../comps/wishlist-button";

const CartTable = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?._id ?? null);

  const cartItems = useCartStore((s) =>
    userId ? s.cartItems : s.localCart
  ) as CartLineItem[];
  const totalAmount = useCartStore((s) => s.totalAmount);
  const isCartLoading = useCartStore((s) => s.isLoading);
  const refreshCart = useCartStore((s) => s.refreshCart);

  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );

  const itemsWithUpdates = cartItems.filter(
    (item) =>
      item.hasUpdates &&
      !dismissedAlerts.has(`${item.productId}-${item.productSize}`)
  );

  const handleDismissAlert = (productId: string, productSize: string) => {
    setDismissedAlerts(
      (prev) => new Set([...prev, `${productId}-${productSize}`])
    );

    if (!userId) {
      const updatedItems = useCartStore.getState().localCart.map((item) =>
        item.productId === productId && item.productSize === productSize
          ? {
              ...item,
              priceChanged: false,
              titleChanged: false,
              hasUpdates: false,
              oldPrice: null,
              newPrice: null,
            }
          : item
      );
      useCartStore.setState({ localCart: updatedItems });
    }

    setTimeout(() => refreshCart(userId, false), 100);
  };

  if (!cartItems.length) return null;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 12) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {itemsWithUpdates.length > 0 ? (
          <View style={styles.alerts}>
            {itemsWithUpdates.map((item) => (
              <PriceUpdateAlert
                key={`${item.productId}-${item.productSize}`}
                item={item}
                onDismiss={handleDismissAlert}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Your Selection</Text>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={styles.divider} />
          <Text style={styles.headerCount}>
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </Text>
        </View>

        <View style={styles.list}>
          {cartItems.map((data, index) => {
            const alertKey = `${data.productId}-${data.productSize}`;
            const showPriceChange =
              data.priceChanged && !dismissedAlerts.has(alertKey);

            return (
              <View key={`${alertKey}-${index}`} style={styles.itemCard}>
                <Pressable
                  onPress={() => router.push(`/product/${data.handle}` as never)}
                  style={styles.imageWrapper}
                >
                  <ImageContainer
                    uri={data.featured_image}
                    backgroundColor="#F2EFE9"
                    placeholderText=""
                    fallbackAspectRatio={2 / 3}
                  />
                </Pressable>

                <View style={styles.middle}>
                  <View style={styles.titleRow}>
                    <Text style={styles.itemTitle}>{data.title}</Text>
                    {showPriceChange ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Price Updated</Text>
                      </View>
                    ) : null}
                  </View>

                  {data.availableSizes && data.availableSizes.length > 1 ? (
                    <SizeSelector item={data} />
                  ) : (
                    <Text style={styles.sizeText}>Size: {data.productSize}</Text>
                  )}

                  <View style={styles.priceRow}>
                    {showPriceChange ? (
                      <>
                        <Text style={styles.oldPrice}>
                          {formatCurrency(data.oldPrice ?? 0)}
                        </Text>
                        <Text style={styles.newPrice}>
                          {formatCurrency(data.price)}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.price}>
                        {formatCurrency(data.price)}
                      </Text>
                    )}
                  </View>

                  {data.isAvailable === false ? (
                    <Text style={styles.stockError}>
                      {data.stockError ||
                        (data.currentStock === 0 ||
                        typeof data.currentStock === "undefined"
                          ? "Out of stock"
                          : `Only ${data.currentStock} left`)}
                    </Text>
                  ) : (
                    <UpdateQuantity data={data} />
                  )}

                  <Text style={styles.subtotalText}>
                    Subtotal:{" "}
                    <Text style={styles.subtotalValue}>
                      {formatCurrency(data.price * data.quantity)}
                    </Text>
                  </Text>
                </View>

                <View style={styles.actions}>
                  <View style={styles.wishlistCircle}>
                    <WishlistButton item={cartItemToWishlistItem(data)} />
                  </View>
                  <RemoveFromCart data={data} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryEyebrow}>Order Summary</Text>

          <View style={styles.summaryRows}>
            {cartItems.map((data, i) => (
              <View key={i} style={styles.summaryRow}>
                <Text style={styles.summaryLabel} numberOfLines={1}>
                  {data.title} × {data.quantity}
                </Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(data.price * data.quantity)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>

          <Text style={styles.shippingNote}>
            Shipping calculated at checkout
          </Text>

          <Pressable
            onPress={() => router.push("/checkout" as never)}
            style={({ pressed }) => [
              styles.checkoutButton,
              pressed && styles.checkoutPressed,
            ]}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/" as never)}
            style={styles.continueButton}
          >
            <Text style={styles.continueText}>Continue Shopping</Text>
          </Pressable>
        </View>
      </ScrollView>

      {isCartLoading ? (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#AE7857" />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 32,
    paddingHorizontal: 16,
    gap: 24,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  alerts: {
    gap: 8,
  },

  header: {
    alignItems: "center",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2.6,
    textTransform: "uppercase",
    color: "#A8A29E",
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: "Rexagus",
    color: "#2B2520",
    lineHeight: 36,
    marginTop: 4,
  },
  divider: {
    width: 36,
    height: 2,
    backgroundColor: "#AE7857",
    marginTop: 8,
  },
  headerCount: {
    fontSize: 12,
    color: "#A8A29E",
    marginTop: 10,
  },

  list: {
    gap: 12,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2EFE9",
    borderRadius: 8,
    padding: 12,
  },
  imageWrapper: {
    width: 96,
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#F2EFE9",
  },
  middle: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2B2520",
    textTransform: "capitalize",
    lineHeight: 18,
  },
  badge: {
    backgroundColor: "#F2EFE9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#AE7857",
    letterSpacing: 0.4,
  },
  sizeText: {
    fontSize: 12,
    color: "#A8A29E",
    letterSpacing: 0.3,
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
  oldPrice: {
    fontSize: 12,
    color: "#9A9187",
    textDecorationLine: "line-through",
  },
  newPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#AE7857",
  },
  stockError: {
    fontSize: 12,
    fontWeight: "500",
    color: "#DC2626",
  },
  subtotalText: {
    fontSize: 12,
    color: "#78716C",
  },
  subtotalValue: {
    fontWeight: "700",
    color: "#2B2520",
  },
  actions: {
    alignItems: "center",
    gap: 12,
  },
  wishlistCircle: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#F2EFE9",
  },

  summary: {
    backgroundColor: "#F2EFE9",
    borderRadius: 8,
    padding: 20,
    gap: 16,
  },
  summaryEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: "#78716C",
  },
  summaryRows: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    flex: 1,
    fontSize: 12,
    color: "#57534E",
  },
  summaryValue: {
    marginLeft: 8,
    fontSize: 12,
    color: "#57534E",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E4DED4",
    paddingTop: 14,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#2B2520",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2B2520",
  },
  shippingNote: {
    fontSize: 12,
    color: "#A8A29E",
  },
  checkoutButton: {
    height: 48,
    borderRadius: 4,
    backgroundColor: "#AE7857",
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutPressed: {
    opacity: 0.9,
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  continueButton: {
    alignItems: "center",
    paddingVertical: 4,
  },
  continueText: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#78716C",
  },
});

export default CartTable;