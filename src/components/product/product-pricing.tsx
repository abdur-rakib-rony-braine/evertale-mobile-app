import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/api/products";

interface ProductPricingProps {
  product: Product;
}

const AFTERPAY_TERMS_URL = "https://www.afterpay.com/en-AU/terms-of-service";

const ProductPricing = ({ product }: ProductPricingProps) => {
  const showCompare =
    product?.price !== product?.compareAtPrice &&
    (product?.compareAtPrice || 0) > 0;

  return (
    <View style={styles.container}>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatCurrency(product?.price)}</Text>
        {showCompare ? (
          <Text style={styles.comparePrice}>
            {formatCurrency(product?.compareAtPrice)}
          </Text>
        ) : null}
      </View>

      <View style={styles.afterpayRow}>
        <Text style={styles.afterpayText}>
          or 4 interest-free payments of{" "}
          {formatCurrency((product?.price || 0) / 4)} with
        </Text>
        <Pressable
          onPress={() => Linking.openURL(AFTERPAY_TERMS_URL)}
          hitSlop={6}
        >
          <Text style={styles.learnMore}>Afterpay</Text>
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL(AFTERPAY_TERMS_URL)}
          hitSlop={6}
        >
          <Text style={styles.learnMore}>Learn more</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1917",
  },
  comparePrice: {
    fontSize: 14,
    color: "#A8A29E",
    textDecorationLine: "line-through",
  },
  afterpayRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  afterpayText: {
    fontSize: 12,
    color: "#78716C",
  },
  learnMore: {
    fontSize: 12,
    color: "#AE7857",
    textDecorationLine: "underline",
  },
});

export default ProductPricing;