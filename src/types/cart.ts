import { CartItem } from "@/store/cart-store";

export type CartLineItem = CartItem & {
  priceChanged?: boolean;
  titleChanged?: boolean;
  oldPrice?: number | null;
  newPrice?: number | null;
  isAvailable?: boolean;
  stockError?: string;
  currentStock?: number;
};