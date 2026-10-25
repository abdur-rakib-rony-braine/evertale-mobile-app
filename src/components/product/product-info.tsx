import { useState } from "react";
import { StyleSheet, View } from "react-native";

import AddToCartButton from "@/components/others/add-to-cart-button";
import ProductColorSelector from "./product-color-selector";
import ProductHeader from "./product-header";
import ProductInfoSheets from "./product-info-sheets";
import ProductMediaGrid from "./product-media-grid";
import ProductPricing from "./product-pricing";
import ProductShareBar from "./product-share-bar";
import ProductSizeSelector from "./product-size-selector";
import SoldOut from "./sold-out";
import type { Product, ProductSize } from "@/lib/api/products";

interface ProductInfoProps {
  product: Product;
  onReviewClick?: () => void;
}

const ProductInfo = ({ product, onReviewClick }: ProductInfoProps) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [inStock, setInStock] = useState(0);

  const allMedia = [
    ...(product?.images || []),
    ...(product?.promovideos || []),
  ];

  const handleSizeSelect = (size: ProductSize) => {
    setSelectedSize(size?.name);
    setInStock(size?.stockQuantity);
  };

  return (
    <View style={styles.container}>
      <ProductMediaGrid
        media={allMedia}
        videoThumbnail={product?.videoThumbnail}
        product={product}
      />

      <View style={styles.infoSection}>
        <ProductHeader product={product} onReviewClick={onReviewClick ?? (() => {})} />
        <ProductPricing product={product} />
        <ProductColorSelector product={product} />
        <ProductSizeSelector
          product={product}
          selectedSize={selectedSize}
          inStock={inStock}
          onSelect={handleSizeSelect}
        />

        {selectedSize && inStock === 0 ? (
          <SoldOut product={product} productSize={selectedSize} />
        ) : (
          <AddToCartButton
            productSize={selectedSize}
            product={{
              _id: product._id,
              title: product.title,
              featured_image: product.featured_image,
              price: product.price,
              subCategory: product.subCategory,
              handle: product.handle,
              sizes: product.sizes,
            }}
            isLogo
          />
        )}

        <ProductInfoSheets product={product} />

        <ProductShareBar
          product={product}
          selectedMedia={product?.featured_image || allMedia[0]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
  },
  infoSection: {
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 8,
  },
});

export default ProductInfo;