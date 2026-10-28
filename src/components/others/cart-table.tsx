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
import { formatCurrency } from "@/lib/format";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { CartLineItem } from "@/types/cart";
import PriceUpdateAlert from "./price-update-alert";
import RemoveFromCart from "./remove-from-cart";
import SizeSelector from "./size-selector";
import UpdateQuantity from "./update-quantity";
import { cartItemToWishlistItem } from "@/lib/wishlist-item";
import WishlistButton from "../comps/wishlist-button";
import { Image } from "expo-image";

const CartTable = () => {
  const router = useRouter();
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
        contentContainerStyle={styles.scrollContent}
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
              <View
                key={`${alertKey}-${index}`}
                style={styles.itemCard}
              >
                <Pressable
                  onPress={() => router.push(`/product/${data.handle}` as never)}
                  style={styles.imageWrapper}
                >
                  <Image
                    source={{ uri: data.featured_image }}
                    style={styles.image}
                    resizeMode="cover"
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
                  <WishlistButton item={cartItemToWishlistItem(data)} />
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
            style={styles.checkoutButton}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/" as never)}>
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
    paddingVertical: 40,
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
    gap: 4,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2.6,
    textTransform: "uppercase",
    color: "#A8A29E",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "600",
    color: "#1C1917",
    lineHeight: 36,
  },
  headerCount: {
    fontSize: 12,
    color: "#A8A29E",
  },

  list: {
    gap: 12,
  },
  itemCard: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "#FAF6F1",
    padding: 16,
  },
  imageWrapper: {
    height: 144,
    width: 96,
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: "#F5F5F4",
  },
  image: {
    height: "100%",
    width: "100%",
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
    color: "#292524",
    textTransform: "capitalize",
    lineHeight: 18,
  },
  badge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#15803D",
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
    fontWeight: "600",
    color: "#292524",
  },
  oldPrice: {
    fontSize: 12,
    color: "#F87171",
    textDecorationLine: "line-through",
  },
  newPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#16A34A",
  },
  stockError: {
    fontSize: 12,
    color: "#EF4444",
  },
  subtotalText: {
    fontSize: 12,
    color: "#78716C",
  },
  subtotalValue: {
    fontWeight: "600",
    color: "#292524",
  },
  actions: {
    alignItems: "flex-end",
    gap: 12,
  },

  summary: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 24,
    gap: 16,
  },
  summaryEyebrow: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: "#A8A29E",
  },
  summaryRows: {
    gap: 8,
    paddingTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    flex: 1,
    fontSize: 12,
    color: "#78716C",
  },
  summaryValue: {
    marginLeft: 8,
    fontSize: 12,
    color: "#78716C",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#57534E",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1917",
  },
  shippingNote: {
    fontSize: 12,
    color: "#A8A29E",
  },
  checkoutButton: {
    backgroundColor: "#AE7857",
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  continueText: {
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#A8A29E",
  },
});

export default CartTable;