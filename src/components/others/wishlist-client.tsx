import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
import WishlistProductCard from "./wishlist-product-card";
import WishlistSkeleton from "./wishlist-skeleton";

interface WishlistClientProps {
  userId?: string;
}

const showSuccess = (message: string) =>
  Toast.show({ type: "success", text1: message });

const showError = (message: string) =>
  Toast.show({ type: "error", text1: message });

const WishlistClient = ({ userId }: WishlistClientProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const authUserId = useAuthStore((s) => s.user?._id ?? null);
  const activeUserId = authUserId ?? userId ?? null;

  const wishlistItems = useWishlistStore((s) =>
    activeUserId ? s.items : s.localWishlist
  );
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);

  const [isLoading, setIsLoading] = useState(true);
  const [isRemovingAll, setIsRemovingAll] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);

      if (activeUserId) {
        await fetchWishlist();
      } else if (!useWishlistStore.persist.hasHydrated()) {
        await new Promise<void>((resolve) => {
          const unsubscribe = useWishlistStore.persist.onFinishHydration(() => {
            unsubscribe();
            resolve();
          });
        });
      }

      if (active) setIsLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, [activeUserId, fetchWishlist]);

  const removeAllFromWishlist = async () => {
    setIsRemovingAll(true);
    try {
      if (activeUserId) {
        await Promise.all(
          wishlistItems.map((item) =>
            apiClient.delete("/api/wishlist", {
              data: {
                productId: item.productId,
                productType: item.productType,
              },
            })
          )
        );
      }

      clear(activeUserId);
      showSuccess("All items removed from wishlist");
    } catch {
      showError("Error removing items");
      if (activeUserId) await fetchWishlist();
    } finally {
      setIsRemovingAll(false);
    }
  };

  if (isLoading) return <WishlistSkeleton />;

  if (wishlistItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrapper}>
          <Heart size={34} color="#AE7857" strokeWidth={1.5} />
        </View>

        <View style={styles.emptyTextWrapper}>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save the pieces you love and come back to them any time.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/" as never)}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom, 12) + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerEyebrow}>Saved Items</Text>
            <Text style={styles.headerTitle}>Wishlist</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.countText}>
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"}
            </Text>

            <Pressable
              onPress={removeAllFromWishlist}
              disabled={isRemovingAll}
              hitSlop={8}
              style={styles.clearAllButton}
            >
              {isRemovingAll ? (
                <>
                  <ActivityIndicator size="small" color="#AE7857" />
                  <Text style={styles.clearAllText}>Removing...</Text>
                </>
              ) : (
                <Text style={styles.clearAllText}>Clear all</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.list}>
          {wishlistItems.map((item) => (
            <WishlistProductCard
              key={item.productId}
              item={item}
              onRemove={() => remove(item.productId, activeUserId)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={() => router.push("/" as never)}
            style={styles.outlineButton}
          >
            <Text style={styles.outlineButtonText}>Continue Shopping</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  content: {
    gap: 24,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2EFE9",
    paddingBottom: 18,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2.6,
    textTransform: "uppercase",
    color: "#A8A29E",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: "Rexagus",
    color: "#2B2520",
    lineHeight: 36,
  },
  divider: {
    width: 36,
    height: 2,
    backgroundColor: "#AE7857",
    marginTop: 8,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 8,
    flexShrink: 0,
  },
  countText: {
    fontSize: 12,
    color: "#A8A29E",
  },
  clearAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    color: "#AE7857",
  },

  list: {
    gap: 12,
  },

  footer: {
    alignItems: "center",
    paddingTop: 8,
  },
  outlineButton: {
    height: 46,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2B2520",
    borderRadius: 4,
  },
  outlineButtonText: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "700",
    color: "#2B2520",
  },
  primaryButton: {
    height: 46,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    backgroundColor: "#AE7857",
  },
  primaryButtonText: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "700",
    color: "#FFFFFF",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  emptyIconWrapper: {
    height: 80,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
    backgroundColor: "#F2EFE9",
  },
  emptyTextWrapper: {
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Rexagus",
    color: "#2B2520",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#A8A29E",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
});

export default WishlistClient;