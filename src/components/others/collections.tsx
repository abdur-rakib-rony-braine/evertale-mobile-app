import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ImageContainer from "@/components/image-container";

interface Collection {
  _id?: string;
  title: string;
  description?: string;
  topLine?: string;
  imageUrl?: string;
}

interface CollectionsProps {
  collections: Collection[];
}

export default function Collections({ collections }: CollectionsProps) {
  const router = useRouter();

  if (!collections?.length) return null;

  return (
    <View style={styles.container}>
      {collections.map((item, i) => (
        <Pressable
          key={item._id || i}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() =>
            router.push(
              `/collections?collection=${encodeURIComponent(item.title || "")}` as never
            )
          }
        >
          <View style={styles.textColumn}>
            {item.topLine ? (
              <Text style={styles.topLine}>{item.topLine}</Text>
            ) : null}

            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.title}>Collections</Text>
            </View>

            {item.description ? (
              <Text style={styles.description} numberOfLines={3}>
                {item.description}
              </Text>
            ) : null}

            <View style={styles.shopBtn}>
              <Text style={styles.shopBtnText}>Shop Now</Text>
              <ArrowRight size={12} color="#2B2520" strokeWidth={2} />
            </View>
          </View>

          <View style={styles.imageColumn}>
            {item.imageUrl ? (
              <ImageContainer
                uri={item.imageUrl}
                backgroundColor="transparent"
                placeholderText=""
                adaptToImage={false}
              />
            ) : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    flexDirection: "row",
    minHeight: 420,
    backgroundColor: "#F2EFE9",
    borderRadius: 8,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.92,
  },
  textColumn: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
    zIndex: 10,
  },
  topLine: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: "#A8A29E",
  },
  title: {
    fontSize: 26,
    fontFamily: "Rexagus",
    color: "#2B2520",
    lineHeight: 30,
  },
  description: {
    fontSize: 13,
    color: "#57534E",
    lineHeight: 20,
  },
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2B2520",
    borderRadius: 4,
  },
  shopBtnText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#2B2520",
  },
  imageColumn: {
    flex: 1,
    overflow: "hidden",
  },
});