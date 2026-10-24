import { images } from "@/constants/images";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { Heart, Menu, ShoppingBag, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { WithLocalSvg } from "react-native-svg/css";
import MobileDrawer from "./mobile-drawer";
import SearchComponent from "./search-component";

export default function HeaderBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [picFailed, setPicFailed] = useState(false);
  const router = useRouter();

  const cartTotal = useCartStore((s) => s.totalItems);
  const wishlistCount = useWishlistStore((s) => s.count);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setPicFailed(false);
  }, [user?.profilePicture]);

  return (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.headerInner}>
          <View style={styles.leftGroup}>
            <Pressable
              onPress={() => setDrawerOpen(true)}
              hitSlop={10}
              style={styles.menuBtn}
            >
              <Menu size={22} color="#AE7857" strokeWidth={2} />
            </Pressable>

            <Pressable onPress={() => router.push("/")}>
              <WithLocalSvg
                asset={images.logo}
                width={100}
                height={32}
              />
            </Pressable>
          </View>

          <View style={styles.rightGroup}>
            <SearchComponent />

            {user && (
              <Pressable onPress={() => router.push("/wishlist" as never)} hitSlop={8}>
                <View>
                  <Heart size={20} color="#44403C" strokeWidth={1.8} />
                  {wishlistCount > 0 && (
                    <View style={styles.wishlistBadge}>
                      <Text style={styles.badgeText}>{wishlistCount}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            )}

            <Pressable onPress={() => router.push("/cart" as never)} hitSlop={8}>
              <View>
                <ShoppingBag size={20} color="#44403C" strokeWidth={1.8} />
                {cartTotal > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.badgeText}>{cartTotal}</Text>
                  </View>
                )}
              </View>
            </Pressable>

            <Pressable onPress={() => router.push("/account" as never)} hitSlop={8}>
              {user?.profilePicture && !picFailed ? (
                <ExpoImage
                  source={{ uri: user.profilePicture }}
                  style={styles.profilePic}
                  contentFit="cover"
                  transition={150}
                  onError={() => setPicFailed(true)}
                />
              ) : (
                <User size={20} color="#44403C" strokeWidth={1.8} />
              )}
            </Pressable>
          </View>
        </View>
      </View>

      <MobileDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuBtn: {
    padding: 4,
    marginLeft: -4,
  },
  cartBadge: {
    position: "absolute",
    right: -8,
    top: -8,
    height: 16,
    minWidth: 16,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#AE7857",
  },
  wishlistBadge: {
    position: "absolute",
    right: -8,
    top: -8,
    height: 16,
    minWidth: 16,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#FC5132",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profilePic: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});