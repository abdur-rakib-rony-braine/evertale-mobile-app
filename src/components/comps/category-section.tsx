import { Image as RNImage, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";

import { images } from "@/constants/images";

const FALLBACK_RATIO = 3 / 4;

interface Category {
  _id: number;
  title: string;
  subtitle: string;
  href: string;
  imageSrc: any;
  buttonText: string;
  comingSoon?: boolean;
}

const categoriesData: Category[] = [
  {
    _id: 1,
    title: "Women's",
    subtitle: "New Season",
    href: "/womens",
    imageSrc: images.womenCategory,
    buttonText: "Shop Women's",
  },
  {
    _id: 2,
    title: "Kid's",
    subtitle: "Little Ones",
    href: "/kids",
    imageSrc: images.kidsCategory,
    buttonText: "Shop Kid's",
  },
  {
    _id: 3,
    title: "Men's",
    subtitle: "Coming Soon",
    href: "/mens/categories",
    imageSrc: images.menCategory,
    buttonText: "Shop Men's",
    comingSoon: true,
  },
];

const ratioFor = (source: any) => {
  const resolved = RNImage.resolveAssetSource(source);
  const w = resolved?.width ?? 0;
  const h = resolved?.height ?? 0;
  return w > 0 && h > 0 ? w / h : FALLBACK_RATIO;
};

export default function CategorySection() {
  const router = useRouter();

  const handlePress = (category: Category) => {
    if (category.comingSoon) return;
    router.push(category.href as any);
  };

  return (
    <View style={styles.container}>
      {categoriesData.map((category) => (
        <Pressable
          key={category._id}
          onPress={() => handlePress(category)}
          style={({ pressed }) => [
            styles.card,
            pressed && !category.comingSoon && styles.cardPressed,
          ]}
        >
          <View style={{ width: "100%", aspectRatio: ratioFor(category.imageSrc) }}>
            <Image
              source={category.imageSrc}
              contentFit="cover"
              transition={150}
              style={styles.image}
            />
          </View>

          <View style={styles.overlay} pointerEvents="none">
            <Text style={styles.subtitle}>{category.subtitle}</Text>
            <Text style={styles.title}>{category.title}</Text>
            <View style={styles.button}>
              <Text style={styles.buttonText}>{category.buttonText}</Text>
              <ArrowRight size={12} color="#2B2520" strokeWidth={2} />
            </View>
          </View>

          {category.comingSoon ? (
            <View style={styles.badge} pointerEvents="none">
              <Text style={styles.badgeText}>Coming Soon</Text>
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  card: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F2EFE9",
  },
  cardPressed: {
    opacity: 0.92,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
    backgroundColor: "rgba(43,37,32,0.38)",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Rexagus",
    lineHeight: 34,
    marginBottom: 14,
  },
  button: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  buttonText: {
    color: "#2B2520",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  badge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#AE7857",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#FFFFFF",
  },
});