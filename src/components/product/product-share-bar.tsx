import { Linking, Pressable, Share, StyleSheet, Text, View } from "react-native";
import {
  Mail,
  MessageCircle,
  MessageSquareText,
  Share2,
} from "lucide-react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import type { Product } from "@/lib/api/products";

const SITE_URL = "https://www.evertale.com.au";

interface ProductShareBarProps {
  product: Product;
  selectedMedia?: string;
}

const ProductShareBar = ({ product, selectedMedia }: ProductShareBarProps) => {
  const productUrl = `${SITE_URL}/product/${product?.handle || ""}`;
  const imageUrl =
    selectedMedia || product?.featured_image || product?.images?.[0] || "";

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const handleShare = (channel: "facebook" | "whatsapp" | "sms" | "email") => {
    switch (channel) {
      case "facebook":
        return openUrl(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            productUrl
          )}`
        );
      case "whatsapp":
        return openUrl(
          `https://wa.me/?text=${encodeURIComponent(
            `Check out this product! ${productUrl}`
          )}`
        );
      case "sms":
        return openUrl(`sms:?&body=${encodeURIComponent(productUrl)}`);
      case "email":
        return openUrl(
          `mailto:?subject=${encodeURIComponent(
            product?.title || "Check this out"
          )}&body=${encodeURIComponent(productUrl)}`
        );
    }
  };

  const shareToInstagram = () => {
    openUrl("instagram://app");
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `${product?.title || "Check this out"} ${productUrl}`,
        url: productUrl,
      });
    } catch {
      // user cancelled
    }
  };

  const actions = [
    {
      key: "facebook",
      fn: () => handleShare("facebook"),
      icon: <FontAwesome5 name="facebook-f" size={16} color="#1877F2" />,
      label: "Share on Facebook",
      bg: "#EFF6FF",
    },
    {
      key: "whatsapp",
      fn: () => handleShare("whatsapp"),
      icon: <MessageCircle size={16} color="#25D366" strokeWidth={1.8} />,
      label: "Share via WhatsApp",
      bg: "#F0FDF4",
    },
    {
      key: "instagram",
      fn: shareToInstagram,
      icon: <FontAwesome5 name="instagram" size={16} color="#E1306C" />,
      label: "Share on Instagram",
      bg: "#FDF2F8",
    },
    {
      key: "sms",
      fn: () => handleShare("sms"),
      icon: (
        <MessageSquareText size={16} color="#60A5FA" strokeWidth={1.8} />
      ),
      label: "Share via SMS",
      bg: "#EFF6FF",
    },
    {
      key: "email",
      fn: () => handleShare("email"),
      icon: <Mail size={16} color="#78716C" strokeWidth={1.8} />,
      label: "Share via Email",
      bg: "#F5F5F4",
    },
    {
      key: "more",
      fn: handleNativeShare,
      icon: <Share2 size={16} color="#78716C" strokeWidth={1.8} />,
      label: "More options",
      bg: "#F5F5F4",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Share</Text>

      <View style={styles.row}>
        {actions.map(({ key, fn, icon, label, bg }) => (
          <Pressable
            key={key}
            onPress={fn}
            accessibilityLabel={label}
            style={[styles.iconButton, { backgroundColor: bg }]}
          >
            {icon}
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  heading: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: "#A8A29E",
    textAlign: "center",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProductShareBar;