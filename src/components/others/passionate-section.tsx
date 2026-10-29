import {
  Dimensions,
  Image as RNImage,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { images } from "@/constants/images";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PADDING = 16;
const GAP = 6;
const AVAILABLE_WIDTH = SCREEN_WIDTH - PADDING * 2 - GAP;
const FALLBACK_RATIO = 3 / 4;

const ratioFor = (source: any) => {
  const resolved = RNImage.resolveAssetSource(source);
  const w = resolved?.width ?? 0;
  const h = resolved?.height ?? 0;
  return w > 0 && h > 0 ? w / h : FALLBACK_RATIO;
};

const leftRatio = ratioFor(images.pp2);
const topRatio = ratioFor(images.pp1);
const bottomRatio = ratioFor(images.pp3);

const rightStackFactor = 1 / topRatio + 1 / bottomRatio;
const rightWidth =
  (AVAILABLE_WIDTH / leftRatio - GAP) / (rightStackFactor + 1 / leftRatio);
const leftWidth = AVAILABLE_WIDTH - rightWidth;

export default function PassionateSection() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Our Story</Text>
        <Text style={styles.title}>We Are So Passionate</Text>
        <Text style={styles.description}>
          Slowly building an intentional closet. Made in small batches. Each
          piece has a tale and will serve you a purpose. So, you spend less time
          agonizing over what to wear. To have and to hold for many years.
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={{ width: leftWidth }}>
          <Image
            source={images.pp2}
            contentFit="cover"
            transition={150}
            style={[styles.image, { aspectRatio: leftRatio }]}
          />
        </View>

        <View style={[styles.rightColumn, { width: rightWidth }]}>
          <Image
            source={images.pp1}
            contentFit="cover"
            transition={150}
            style={[styles.image, { aspectRatio: topRatio }]}
          />
          <Image
            source={images.pp3}
            contentFit="cover"
            transition={150}
            style={[styles.image, { aspectRatio: bottomRatio }]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.storyBtn}
          onPress={() => router.push("/about" as never)}
        >
          <Text style={styles.storyBtnText}>See Our Story</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: "#A8A29E",
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontFamily: "Rexagus",
    color: "#262626",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#78716C",
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 400,
  },
  grid: {
    flexDirection: "row",
    gap: GAP,
    alignItems: "flex-start",
  },
  rightColumn: {
    gap: GAP,
  },
  image: {
    width: "100%",
    borderRadius: 4,
    backgroundColor: "#F2EFE9",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  storyBtn: {
    borderWidth: 1,
    borderColor: "#2B2520",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
  },
  storyBtnText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#2B2520",
  },
});