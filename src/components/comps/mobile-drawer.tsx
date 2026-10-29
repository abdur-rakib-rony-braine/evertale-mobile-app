import { useRouter } from "expo-router";
import {
  Camera,
  ChevronRight,
  Globe,
  Heart,
  LogOut,
  Minus,
  Play,
  Plus,
  ShoppingBag,
  User,
  Mail,
  X,
} from "lucide-react-native";
import { WithLocalSvg } from "react-native-svg/css";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { images } from "@/constants/images";
import { urls } from "@/constants/url";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(width * 0.86, 360);

interface MobileDrawerProps {
  visible: boolean;
  onClose: () => void;
}

interface Category {
  id: number;
  title: string;
  link: string;
  featured?: { id: number; name: string; link: string }[];
}

const categories: Category[] = [
  {
    id: 1,
    title: "Women's",
    link: "/womens",
    featured: [
      { id: 1, name: "Midi Dress", link: "/womens/midi-dress" },
      { id: 2, name: "Maxi Dress", link: "/womens/maxi-dress" },
    ],
  },
  {
    id: 2,
    title: "Kid's",
    link: "/kids",
    featured: [
      { id: 1, name: "Mini Dress", link: "/kids/mini-dress" },
      { id: 2, name: "Midi Dress", link: "/kids/midi-dress" },
    ],
  },
  { id: 3, title: "New Arrivals", link: "/new-arrivals" },
  { id: 4, title: "Best Seller", link: "/best-sellers" },
];

const accountLinks = [
  { title: "My Account", link: "/account", Icon: User },
  { title: "Contact Us", link: "/contact", Icon: Mail },
];

const TikTokIcon = ({ size = 16, color = "#78716C" }) => (
  <View
    style={{
      width: size,
      height: size,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ color, fontSize: size * 0.9, fontWeight: "700" }}>♪</Text>
  </View>
);

export default function MobileDrawer({ visible, onClose }: MobileDrawerProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore((s) => s.totalItems);
  const wishlistCount = useWishlistStore((s) =>
    token ? s.items.length : s.localWishlist.length
  );
  const [expanded, setExpanded] = useState<number | null>(null);
  const translateX = useSharedValue(-DRAWER_WIDTH);

  useEffect(() => {
    translateX.value = withTiming(visible ? 0 : -DRAWER_WIDTH, {
      duration: 300,
      easing: Easing.inOut(Easing.cubic),
    });
    if (!visible) setExpanded(null);
  }, [visible]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-DRAWER_WIDTH, 0], [0, 1]),
  }));

  const navigate = (link: string, authRequired?: boolean) => {
    onClose();

    if (authRequired && !token) {
      Toast.show({ type: "error", text1: "Please log in to continue" });
      router.push("/account" as any);
      return;
    }

    router.push(link as any);
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    router.replace("/");
    Toast.show({
      type: "success",
      text1: "Logged out",
    });
  };

  const toggleCategory = (cat: Category) => {
    if (!cat.featured) {
      navigate(cat.link);
      return;
    }
    setExpanded((prev) => (prev === cat.id ? null : cat.id));
  };

  const quickLinks = [
    {
      title: "Cart",
      link: "/cart",
      Icon: ShoppingBag,
      count: token ? cartCount : 0,
      authRequired: true,
    },
    {
      title: "Wishlist",
      link: "/wishlist",
      Icon: Heart,
      count: wishlistCount,
      authRequired: false,
    },
  ];

  const socials = [
    { key: "facebook", url: urls.social.facebook, node: <Globe size={16} color="#78716C" /> },
    { key: "instagram", url: urls.social.instagram, node: <Camera size={16} color="#78716C" /> },
    { key: "tiktok", url: urls.social.tiktok, node: <TikTokIcon size={16} /> },
    { key: "youtube", url: urls.social.youtube, node: <Play size={16} color="#78716C" /> },
  ];

  return (
    <>
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.drawer, drawerStyle]}>
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <Pressable onPress={() => navigate("/")} hitSlop={8}>
            <WithLocalSvg asset={images.logo} width={104} height={34} />
          </Pressable>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
            <X size={18} color="#2B2520" />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionHeading}>SHOP</Text>

          {categories.map((cat) => {
            const isHighlight =
              cat.title === "New Arrivals" || cat.title === "Best Seller";
            const isOpen = expanded === cat.id;

            return (
              <View key={cat.id} style={styles.categoryBlock}>
                <Pressable
                  onPress={() => toggleCategory(cat)}
                  style={styles.categoryRow}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isHighlight && styles.categoryTextHighlight,
                    ]}
                  >
                    {cat.title}
                  </Text>
                  {cat.featured ? (
                    isOpen ? (
                      <Minus size={16} color="#AE7857" />
                    ) : (
                      <Plus size={16} color="#A8A29E" />
                    )
                  ) : (
                    <ChevronRight size={16} color={isHighlight ? "#AE7857" : "#A8A29E"} />
                  )}
                </Pressable>

                {isOpen && cat.featured ? (
                  <View style={styles.subList}>
                    {cat.featured.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() => navigate(item.link)}
                        style={styles.subRow}
                      >
                        <Text style={styles.subText}>{item.name}</Text>
                      </Pressable>
                    ))}
                    <Pressable
                      onPress={() => navigate(cat.link)}
                      style={styles.subRow}
                    >
                      <Text style={styles.subTextAll}>Shop All {cat.title}</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })}

          <View style={styles.quickRow}>
            {quickLinks.map(({ title, link, Icon, count, authRequired }) => (
              <Pressable
                key={title}
                onPress={() => navigate(link, authRequired)}
                style={styles.quickCard}
              >
                <View>
                  <Icon size={20} color="#2B2520" strokeWidth={1.6} />
                  {count > 0 ? (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{count}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.quickText}>{title}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.sectionHeading, styles.accountHeading]}>
            ACCOUNT
          </Text>

          {accountLinks.map(({ title, link, Icon }) => (
            <Pressable
              key={title}
              onPress={() => navigate(link)}
              style={styles.accountRow}
            >
              <Icon size={17} color="#78716C" strokeWidth={1.7} />
              <Text style={styles.accountText}>{title}</Text>
            </Pressable>
          ))}

          {token ? (
            <Pressable onPress={handleLogout} style={styles.accountRow}>
              <LogOut size={17} color="#DC2626" strokeWidth={1.7} />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
          <Text style={styles.footerHeading}>FOLLOW US</Text>
          <View style={styles.socialRow}>
            {socials.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => openLink(s.url)}
                hitSlop={6}
                style={styles.socialButton}
              >
                {s.node}
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(43,37,32,0.45)",
    zIndex: 998,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#FFFFFF",
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#F2EFE9",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2.5,
    color: "#A8A29E",
    marginBottom: 6,
  },
  accountHeading: {
    marginTop: 28,
  },
  categoryBlock: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2EFE9",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  categoryText: {
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: 0.2,
    color: "#2B2520",
  },
  categoryTextHighlight: {
    color: "#AE7857",
  },
  subList: {
    paddingBottom: 10,
    paddingLeft: 4,
  },
  subRow: {
    paddingVertical: 9,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#E8DDD3",
  },
  subText: {
    fontSize: 14,
    color: "#57534E",
  },
  subTextAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#AE7857",
    letterSpacing: 0.3,
  },
  quickRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  quickCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#F2EFE9",
    borderRadius: 4,
  },
  quickText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2B2520",
  },
  countBadge: {
    position: "absolute",
    top: -8,
    right: -10,
    height: 17,
    minWidth: 17,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#AE7857",
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
  },
  accountText: {
    fontSize: 14.5,
    fontWeight: "500",
    color: "#44403C",
  },
  logoutText: {
    fontSize: 14.5,
    fontWeight: "500",
    color: "#DC2626",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    backgroundColor: "#F2EFE9",
  },
  footerHeading: {
    fontSize: 10,
    letterSpacing: 2.5,
    color: "#A8A29E",
    marginBottom: 12,
    textAlign: "center",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
  },
  socialButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});