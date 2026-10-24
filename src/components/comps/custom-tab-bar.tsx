import { Home, Heart, ShoppingBag, User } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

const ICONS = {
  index: Home,
  wishlist: Heart,
  cart: ShoppingBag,
  account: User,
};

const LABELS = {
  index: "Home",
  wishlist: "Wishlist",
  cart: "Cart",
  account: "Account",
};

export default function CustomTabBar({ state }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const cartTotal = useCartStore((s) => s.totalItems);
  const wishlistCount = useWishlistStore((s) => s.count);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const Icon = ICONS[route.name as keyof typeof ICONS];
        const label = LABELS[route.name as keyof typeof LABELS];

        if (!Icon) return null;

        const onPress = () => {
          if (!isFocused) {
            const href = route.name === "index" ? "/" : `/${route.name}`;
            router.navigate(href as never);
          }
        };

        const badgeCount = 
          route.name === "cart" ? cartTotal : 
          route.name === "wishlist" ? wishlistCount : 0;

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
            <View>
              <Icon
                size={22}
                color={isFocused ? "#AE7857" : "#78716C"}
                strokeWidth={isFocused ? 2.2 : 1.6}
              />
              {badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeCount}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: isFocused ? "#AE7857" : "#78716C",
                  fontWeight: isFocused ? "600" : "500",
                },
              ]}
            >
              {label}
            </Text>
            {isFocused && <View style={styles.activeIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    position: "relative",
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    height: 2,
    width: 32,
    backgroundColor: "#AE7857",
    borderRadius: 999,
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -6,
    height: 16,
    minWidth: 16,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#FC5132",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});