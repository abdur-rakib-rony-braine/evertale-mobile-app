import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Edit3, Handbag, Truck } from "lucide-react-native";
import { useRouter } from "expo-router";

import { useCheckoutStore } from "@/store/checkout-store";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useDiscountStore } from "@/store/discount-store";
import { formatCurrency } from "@/lib/format";
import DiscountInput from "./discount-input";

const getStockStatus = (
  productSize: string,
  availableSizes: { name: string; stockQuantity: number }[],
  quantity: number
) => {
  const sizeInfo = availableSizes?.find((s) => s.name === productSize);
  if (!sizeInfo || sizeInfo.stockQuantity <= 0) {
    return { status: "OUT_OF_STOCK", message: "Out of stock" };
  }
  if (sizeInfo.stockQuantity < quantity) {
    return { status: "LOW_STOCK", message: `Only ${sizeInfo.stockQuantity} left` };
  }
  return { status: "IN_STOCK", message: "" };
};

const OrderSummary = () => {
  const router = useRouter();
  const { shipping } = useCheckoutStore();
  const { cartItems, totalAmount } = useCartStore();
  const userId = useAuthStore((s) => s.user?._id ?? null);
  const { appliedDiscount, freeShipping, discountData } = useDiscountStore();

  const calculateTotal = () => {
    let total = totalAmount;

    if (appliedDiscount > 0) {
      total = total - appliedDiscount;
    }

    if (!freeShipping && shipping?.cost) {
      total = total + shipping.cost;
    }

    return Math.max(0, total);
  };

  const finalTotal = calculateTotal();
  const getGstAmount = finalTotal / 11;
  const totalQty = cartItems.reduce((a, i) => a + i.quantity, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Handbag size={16} color="#78716C" strokeWidth={1.8} />
          <Text style={styles.headerTitle}>Order Summary</Text>
        </View>
        <Pressable
          onPress={() => router.push("/cart" as never)}
          style={styles.editBtn}
        >
          <Edit3 size={12} color="#A8A29E" strokeWidth={2} />
          <Text style={styles.editText}>Edit Cart</Text>
        </Pressable>
      </View>

      {/* Items List */}
      <View style={styles.itemsBlock}>
        {cartItems?.map((product) => {
          const { status, message } = getStockStatus(
            product.productSize,
            product.availableSizes,
            product.quantity
          );

          return (
            <View
              key={`${product.productId}-${product.productSize}`}
              style={styles.itemRow}
            >
              <View style={styles.imageWrapper}>
                <View style={styles.imageContainer}>
                  {product.featured_image ? (
                    <Image
                      source={{ uri: product.featured_image }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder} />
                  )}
                </View>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyBadgeText}>{product.quantity}</Text>
                </View>
              </View>

              <View style={styles.itemDetails}>
                <View style={styles.itemTitleRow}>
                  <View style={styles.itemTitleCol}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {product.title}
                    </Text>
                    <Text style={styles.itemSize}>
                      Size: <Text style={styles.itemSizeValue}>{product.productSize}</Text>
                    </Text>
                    {message ? (
                      <View style={styles.stockWarning}>
                        <View
                          style={[
                            styles.stockDot,
                            status === "OUT_OF_STOCK"
                              ? styles.stockDotRed
                              : styles.stockDotAmber,
                          ]}
                        />
                        <Text
                          style={[
                            styles.stockMessage,
                            status === "OUT_OF_STOCK"
                              ? styles.stockMessageRed
                              : styles.stockMessageAmber,
                          ]}
                        >
                          {message}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.itemPriceCol}>
                    <Text style={styles.itemPrice}>
                      {formatCurrency(product.price * product.quantity)}
                    </Text>
                    {product.quantity > 1 && (
                      <Text style={styles.itemUnitPrice}>
                        {formatCurrency(product.price)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Totals */}
      <View style={styles.totalsBlock}>
        <View style={styles.subtotalRow}>
          <View style={styles.subtotalLeft}>
            <Handbag size={14} color="#78716C" strokeWidth={1.8} />
            <Text style={styles.subtotalLabel}>Subtotal</Text>
            <Text style={styles.subtotalQty}>
              ({totalQty} {totalQty === 1 ? "item" : "items"})
            </Text>
          </View>
          <Text style={styles.subtotalValue}>{formatCurrency(totalAmount)}</Text>
        </View>

        {/* Discount Input */}
        {userId ? (
          <View style={styles.discountWrapper}>
            <DiscountInput cart={{ items: cartItems }} customerId={userId} />
          </View>
        ) : null}

        {/* Show discount if applied */}
        {appliedDiscount > 0 && (
          <View style={styles.appliedDiscountRow}>
            <Text style={styles.appliedDiscountLabel}>
              Discount ({discountData?.discountCode})
            </Text>
            <Text style={styles.appliedDiscountValue}>
              -{formatCurrency(appliedDiscount)}
            </Text>
          </View>
        )}

        {/* Show discounted items breakdown */}
        {discountData?.discountedItems?.length > 0 && (
          <View style={styles.breakdownBox}>
            <Text style={styles.breakdownTitle}>Discounted items:</Text>
            {discountData.discountedItems.map((item: any, index: number) => (
              <View key={index} style={styles.breakdownRow}>
                <Text style={styles.breakdownName}>
                  {item.title} × {item.quantity}
                </Text>
                <Text style={styles.breakdownAmount}>
                  -{formatCurrency(item.discountAmount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {shipping?.method && (
          <View style={styles.shippingRow}>
            <View style={styles.shippingLeft}>
              <Truck size={14} color="#78716C" strokeWidth={1.8} />
              <Text style={styles.shippingLabel}>Shipping</Text>
              <Text style={styles.shippingMethod}>{shipping.method}</Text>
            </View>
            {freeShipping ? (
              <Text style={styles.freeText}>FREE</Text>
            ) : shipping.cost === 0 ? (
              <Text style={styles.freeText}>FREE</Text>
            ) : (
              <Text style={styles.shippingCost}>{formatCurrency(shipping.cost)}</Text>
            )}
          </View>
        )}

        {/* Free shipping badge */}
        {freeShipping && (
          <View style={styles.freeShippingBadge}>
            <Text style={styles.freeShippingBadgeText}>✓ Free shipping applied</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.gstText}>
              Includes {formatCurrency(getGstAmount)} GST
            </Text>
            {appliedDiscount > 0 && (
              <Text style={styles.savedText}>
                Saved {formatCurrency(appliedDiscount)}
              </Text>
            )}
          </View>
          <Text style={styles.totalValue}>{formatCurrency(finalTotal)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#78716C",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
    paddingBottom: 2,
  },
  editText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.44,
    textTransform: "uppercase",
    color: "#A8A29E",
  },
  itemsBlock: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  imageWrapper: {
    position: "relative",
  },
  imageContainer: {
    width: 56,
    height: 64,
    backgroundColor: "#F5F5F4",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E7E5E4",
  },
  qtyBadge: {
    position: "absolute",
    right: -6,
    top: -6,
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: "#44403C",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  itemDetails: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  itemTitleCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#292524",
    lineHeight: 16,
  },
  itemSize: {
    fontSize: 12,
    color: "#A8A29E",
    marginTop: 4,
  },
  itemSizeValue: {
    color: "#57534E",
  },
  stockWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockDotRed: {
    backgroundColor: "#F87171",
  },
  stockDotAmber: {
    backgroundColor: "#FBBF24",
  },
  stockMessage: {
    fontSize: 12,
    fontWeight: "500",
  },
  stockMessageRed: {
    color: "#EF4444",
  },
  stockMessageAmber: {
    color: "#D97706",
  },
  itemPriceCol: {
    alignItems: "flex-end",
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: "600",
    color: "#292524",
  },
  itemUnitPrice: {
    fontSize: 12,
    color: "#A8A29E",
    marginTop: 4,
  },
  totalsBlock: {
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  subtotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtotalLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  subtotalLabel: {
    fontSize: 12,
    color: "#78716C",
  },
  subtotalQty: {
    fontSize: 12,
    color: "#A8A29E",
  },
  subtotalValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#44403C",
  },
  discountWrapper: {
    paddingTop: 4,
  },
  appliedDiscountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appliedDiscountLabel: {
    fontSize: 12,
    color: "#16A34A",
  },
  appliedDiscountValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#16A34A",
  },
  breakdownBox: {
    backgroundColor: "#FAFAF9",
    borderRadius: 4,
    padding: 8,
    gap: 4,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#57534E",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownName: {
    fontSize: 12,
    color: "#57534E",
  },
  breakdownAmount: {
    fontSize: 12,
    color: "#16A34A",
  },
  shippingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shippingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  shippingLabel: {
    fontSize: 12,
    color: "#78716C",
  },
  shippingMethod: {
    fontSize: 12,
    color: "#A8A29E",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  shippingCost: {
    fontSize: 12,
    fontWeight: "500",
    color: "#44403C",
  },
  freeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
  },
  freeShippingBadge: {
    backgroundColor: "#F0FDF4",
    borderRadius: 4,
    padding: 6,
    alignItems: "center",
  },
  freeShippingBadgeText: {
    fontSize: 12,
    color: "#16A34A",
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F4",
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#57534E",
  },
  gstText: {
    fontSize: 12,
    color: "#A8A29E",
    marginTop: 2,
  },
  savedText: {
    fontSize: 12,
    color: "#16A34A",
    marginTop: 2,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1917",
  },
});

export default OrderSummary;