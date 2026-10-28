import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { images } from "@/constants/images";
import { Image } from "expo-image";

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
        <View style={styles.leftColumn}>
          <Image
            source={images.pp2}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.rightColumn}>
          <Image
            source={images.pp1}
            style={styles.smallImage}
            resizeMode="cover"
          />
          <Image
            source={images.pp3}
            style={styles.smallImage}
            resizeMode="cover"
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
    paddingHorizontal: 16,
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
    gap: 6,
    height: 400,
  },
  leftColumn: {
    flex: 1,
    height: "100%",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#F5F5F4",
  },
  rightColumn: {
    flex: 1,
    gap: 6,
  },
  smallImage: {
    width: "100%",
    flex: 1,
    borderRadius: 4,
    backgroundColor: "#F5F5F4",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  storyBtn: {
    borderWidth: 1,
    borderColor: "#292524",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
  },
  storyBtnText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#292524",
  },
});