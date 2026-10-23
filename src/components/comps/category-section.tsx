import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";

import { images } from "@/constants/images";

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
          style={styles.card}
        >
          <ImageBackground
            source={category.imageSrc}
            resizeMode="cover"
            style={styles.imageBg}
          >
            <View style={styles.overlay} />
            <View style={styles.content}>
              <Text style={styles.subtitle}>{category.subtitle}</Text>
              <Text style={styles.title}>{category.title}</Text>
              <View style={styles.buttonRow}>
                <Text style={styles.buttonText}>{category.buttonText}</Text>
                <ArrowRight size={14} color="#FFFFFF" strokeWidth={2} />
              </View>
            </View>

            {category.comingSoon && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Coming Soon</Text>
              </View>
            )}
          </ImageBackground>
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
    aspectRatio: 3 / 4,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  imageBg: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  content: {
    padding: 20,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
    fontWeight: "300",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Rexagus",
    marginBottom: 12,
    lineHeight: 32,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "500",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.5)",
    paddingBottom: 1,
  },
  badge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "500",
    color: "#44403C",
  },
});