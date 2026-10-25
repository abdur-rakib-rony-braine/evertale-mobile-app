import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Heart } from "lucide-react-native";

import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore, WishlistItem } from "@/store/wishlist-store";

interface WishlistButtonProps {
  item: WishlistItem;
}

export default function WishlistButton({ item }: WishlistButtonProps) {
  const userId = useAuthStore((s) => s.user?._id ?? null);
  const toggle = useWishlistStore((s) => s.toggle);
  const isInWishlist = useWishlistStore((s) =>
    (userId ? s.items : s.localWishlist).some(
      (i) => i.productId === item.productId
    )
  );

  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await toggle(item, userId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isLoading}
      hitSlop={8}
      style={styles.button}
      accessibilityLabel={
        isInWishlist ? "Remove from wishlist" : "Add to wishlist"
      }
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#A8A29E" />
      ) : (
        <Heart
          size={16}
          color={isInWishlist ? "#F87171" : "#A8A29E"}
          fill={isInWishlist ? "#F87171" : "transparent"}
          strokeWidth={1.8}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});