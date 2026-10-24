import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import Topbar from "@/components/comps/topbar";
import HeaderBar from "@/components/comps/header-bar";
import { apiClient } from "@/lib/api/client";

interface Category {
  _id: string;
  title: string;
  imageSrc: string;
  href: string;
  buttonText?: string;
}

export default function KidsScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get("/api/categories?type=kids");
        if (res.data?.data) {
          setCategories(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handlePress = (href: string) => {
    router.push(href as never);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Topbar />
      <HeaderBar />

      <View style={styles.header}>
        <Text style={styles.title}>Kid's</Text>
        <Text style={styles.subtitle}>Explore Our Collections</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#AE7857" />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => handlePress(item.href)}
            >
              <ImageBackground
                source={{ uri: item.imageSrc }}
                style={styles.imageBg}
                resizeMode="cover"
              >
                <View style={styles.overlay} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardButton}>
                    {item.buttonText || "Shop Now"}
                  </Text>
                </View>
              </ImageBackground>
            </Pressable>
          )}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No collections found.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF9" },
  header: {
    paddingVertical: 24,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontFamily: "Rexagus",
    color: "#292524",
    textTransform: "capitalize",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#A8A29E",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 8,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14, color: "#78716C" },
  gridContent: { padding: 16, paddingBottom: 40 },
  gridRow: { justifyContent: "space-between", gap: 12, marginBottom: 12 },
  card: {
    width: "48%",
    aspectRatio: 3 / 4,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F5F5F4",
  },
  imageBg: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: "Rexagus",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cardButton: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});