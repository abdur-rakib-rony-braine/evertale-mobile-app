import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

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
          style={styles.card}
          onPress={() =>
            router.push(
              `/collections?collection=${encodeURIComponent(item.title || "")}` as never
            )
          }
        >
          <View style={styles.cardContent}>
            <View style={styles.textColumn}>
              {item.topLine && (
                <Text style={styles.topLine}>{item.topLine}</Text>
              )}

              <View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.title}>Collections</Text>
              </View>

              {item.description && (
                <Text style={styles.description} numberOfLines={3}>
                  {item.description}
                </Text>
              )}

              <View style={styles.shopBtn}>
                <Text style={styles.shopBtnText}>Shop Now</Text>
              </View>
            </View>

            <View style={styles.imageColumn}>
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  resizeMode="contain"
                />
              )}
            </View>
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
    backgroundColor: "#F0EDE8",
    borderRadius: 8,
    overflow: "hidden",
    height: 420,
  },
  cardContent: {
    flexDirection: "row",
    height: "100%",
  },
  textColumn: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
    zIndex: 10,
  },
  topLine: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#78716C",
  },
  title: {
    fontSize: 26,
    fontFamily: "Rexagus",
    color: "#292524",
    lineHeight: 30,
  },
  description: {
    fontSize: 13,
    color: "#57534E",
    lineHeight: 20,
  },
  shopBtn: {
    borderWidth: 1,
    borderColor: "#292524",
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  shopBtnText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#292524",
  },
  imageColumn: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "90%",
    height: "90%",
  },
});