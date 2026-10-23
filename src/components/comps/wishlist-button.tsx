import { Heart } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import { useWishlistStore } from "@/store/wishlist-store";

interface WishlistButtonProps {
  productId: string;
  handle: string;
  subCategory?: string;
}

export default function WishlistButton({
  productId,
  handle,
  subCategory,
}: WishlistButtonProps) {
  const items = useWishlistStore((s) => s.items);
  const toggle = useWishlistStore((s) => s.toggle);

  const isInWishlist = items.some((i) => i.productId === productId);

  return (
    <Pressable
      onPress={() => toggle({ productId, handle, subCategory })}
      hitSlop={8}
      style={styles.button}
    >
      <Heart
        size={16}
        color={isInWishlist ? "#F87171" : "#A8A29E"}
        fill={isInWishlist ? "#F87171" : "transparent"}
        strokeWidth={1.8}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});