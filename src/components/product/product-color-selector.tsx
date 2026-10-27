import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import type { Product } from "@/lib/api/products";

interface ProductColorSelectorProps {
  product: Product;
}

const slugify = (value?: string) =>
  (value || "").toLowerCase().replace(/\s+/g, "-");

const ProductColorSelector = ({ product }: ProductColorSelectorProps) => {
  const router = useRouter();

  if (!product?.colors?.length) return null;

  const buildHref = (colorName?: string) =>
    `/product/${slugify(product?.type)}-${slugify(
      product?.subCategory
    )}-${slugify(colorName)}`;

  const isActive = (colorName?: string) =>
    product?.handle?.toLowerCase().includes(slugify(colorName));

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Colors</Text>

      <View style={styles.row}>
        {product.colors.map((item, i) => {
          const active = isActive(item?.name);
          const uri = item?.url;

          return (
            <Pressable
              key={`${item?._id || item?.name || "color"}-${i}`}
              onPress={() => router.push(buildHref(item?.name) as never)}
              style={styles.item}
              accessibilityLabel={item?.name}
            >
              <View style={[styles.swatch, active && styles.swatchActive]}>
                {uri ? (
                  <Image
                    source={{ uri }}
                    style={styles.swatchImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View style={styles.swatchFallback} />
                )}
              </View>
              <Text
                numberOfLines={1}
                style={[styles.name, active && styles.nameActive]}
              >
                {item?.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    paddingTop: 16,
    gap: 12,
  },
  heading: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.44,
    textTransform: "uppercase",
    color: "#78716C",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 12,
  },
  item: {
    alignItems: "center",
    gap: 6,
    width: 64,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  swatchActive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#292524",
  },
  swatchImage: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  swatchFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F5F5F4",
  },
  name: {
    fontSize: 10,
    fontWeight: "500",
    color: "#78716C",
    textAlign: "center",
    textTransform: "capitalize",
    maxWidth: 64,
  },
  nameActive: {
    color: "#292524",
    fontWeight: "600",
  },
});

export default ProductColorSelector;