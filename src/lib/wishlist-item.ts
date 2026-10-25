import { Product } from "@/lib/api/products";
import { WishlistItem } from "@/store/wishlist-store";
import { CartLineItem } from "@/types/cart";

export const productToWishlistItem = (product: Product): WishlistItem => ({
  productId: product._id,
  title: product.title,
  featured_image: product.featured_image ?? product.images?.[0] ?? "",
  price: product.price,
  compareAtPrice: product.compareAtPrice,
  handle: product.handle,
  subCategory: product.subCategory,
  sizes: product.sizes ?? [],
  productType: product.subCategory,
});

export const cartItemToWishlistItem = (item: CartLineItem): WishlistItem => ({
  productId: item.productId,
  title: item.title,
  featured_image: item.featured_image ?? "",
  price: item.price,
  handle: item.handle,
  subCategory: item.subCategory,
  sizes: item.availableSizes ?? [],
  productType: item.subCategory,
});