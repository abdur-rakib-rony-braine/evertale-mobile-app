import { useRouter } from "expo-router";
import { Camera, Globe, LogOut, Play, Plus, X } from "lucide-react-native";
import { useEffect } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";

import { images } from "@/constants/images";
import { urls } from "@/constants/url";
import { useAuthStore } from "@/store/auth-store";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(width * 0.85, 360);

interface MobileDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const categories = [
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

const mobileLinks = [
  { title: "My Account", link: "/account" },
  { title: "Wishlist", link: "/wishlist" },
  { title: "Contact Us", link: "/contact" },
];

const TikTokIcon = ({ size = 16, color = "#A8A29E" }) => (
  <View
    style={{
      width: size,
      height: size,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ color, fontSize: size * 0.7, fontWeight: "700" }}>♪</Text>
  </View>
);

export default function MobileDrawer({ visible, onClose }: MobileDrawerProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const translateX = useSharedValue(-DRAWER_WIDTH);

  useEffect(() => {
    translateX.value = withTiming(visible ? 0 : -DRAWER_WIDTH, {
      duration: 300,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [visible]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const navigate = (link: string) => {
    onClose();
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

  return (
    <>
      {visible && (
        <Pressable
          onPress={onClose}
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.4)", zIndex: 998 },
          ]}
        />
      )}

      <Animated.View style={[styles.drawer, drawerStyle]}>
        <View style={styles.header}>
          <Image
            source={images.logo}
            style={{ width: 100, height: 30 }}
            resizeMode="contain"
          />
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={20} color="#78716C" />
          </Pressable>
        </View>

        <ScrollView style={styles.scroll}>
          <View style={styles.body}>
            {categories.map((cat) => {
              const isHighlight =
                cat.title === "New Arrivals" || cat.title === "Best Seller";

              return (
                <Pressable
                  key={cat.id}
                  onPress={() => navigate(cat.link)}
                  style={styles.categoryRow}
                >
                  <View style={styles.categoryRowInner}>
                    <Text
                      style={[
                        styles.categoryText,
                        { color: isHighlight ? "#AE7857" : "#292524" },
                      ]}
                    >
                      {cat.title}
                    </Text>
                    {cat.featured && <Plus size={14} color="#A8A29E" />}
                  </View>
                </Pressable>
              );
            })}

            <View style={styles.accountSection}>
              <Text style={styles.accountHeading}>ACCOUNT</Text>
              {mobileLinks.map((link, i) => (
                <Pressable
                  key={i}
                  onPress={() => navigate(link.link)}
                  style={styles.categoryRow}
                >
                  <Text style={styles.accountLinkText}>{link.title}</Text>
                </Pressable>
              ))}

              {token ? (
                <Pressable onPress={handleLogout} style={styles.categoryRow}>
                  <View style={styles.logoutInner}>
                    <LogOut size={16} color="#DC2626" />
                    <Text style={styles.logoutText}>Logout</Text>
                  </View>
                </Pressable>
              ) : null}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerHeading}>FOLLOW US</Text>
          <View style={styles.socialRow}>
            <Pressable
              onPress={() => openLink(urls.social.facebook)}
              hitSlop={6}
            >
              <Globe size={16} color="#A8A29E" />
            </Pressable>
            <Pressable
              onPress={() => openLink(urls.social.instagram)}
              hitSlop={6}
            >
              <Camera size={16} color="#A8A29E" />
            </Pressable>
            <Pressable
              onPress={() => openLink(urls.social.tiktok)}
              hitSlop={6}
            >
              <TikTokIcon size={16} />
            </Pressable>
            <Pressable
              onPress={() => openLink(urls.social.youtube)}
              hitSlop={6}
            >
              <Play size={16} color="#A8A29E" />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#FFFFFF",
    zIndex: 999,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  categoryRowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.25,
  },
  accountSection: {
    paddingTop: 20,
  },
  accountHeading: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
    color: "#A8A29E",
    paddingBottom: 8,
  },
  accountLinkText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#44403C",
  },
  logoutInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#DC2626",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
  },
  footerHeading: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#A8A29E",
    marginBottom: 12,
    textAlign: "center",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
});