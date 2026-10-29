import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";

import Topbar from "@/components/comps/topbar";
import HeaderBar from "@/components/comps/header-bar";
import ImageContainer from "@/components/image-container";
import { apiClient } from "@/lib/api/client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_PADDING = 16;
const GRID_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

interface Category {
  _id: string;
  title: string;
  imageSrc: string;
  href: string;
  buttonText?: string;
}

export default function WomensScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setHasError(false);
      const res = await apiClient.get("/api/categories?type=womens");
      setCategories(res.data?.data ?? []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCategories();
  }, [fetchCategories]);

  const retry = useCallback(() => {
    setIsLoading(true);
    fetchCategories();
  }, [fetchCategories]);

  const handlePress = (href: string) => {
    router.push(href as never);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Women's</Text>
      <View style={styles.divider} />
      <Text style={styles.subtitle}>Explore Our Collections</Text>
    </View>
  );

  const renderEmpty = () => {
    if (hasError) {
      return (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Something went wrong.</Text>
          <Pressable onPress={retry} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No collections found.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Topbar />
      <HeaderBar />

      {isLoading ? (
        <View style={styles.loader}>
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
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#AE7857"
              colors={["#AE7857"]}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handlePress(item.href)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <ImageContainer
                uri={item.imageSrc}
                backgroundColor="#F2EFE9"
                placeholderText=""
              />
              <View style={styles.cardOverlay} pointerEvents="none">
                <Text numberOfLines={2} style={styles.cardTitle}>
                  {item.title}
                </Text>
                <View style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>
                    {item.buttonText || "Shop Now"}
                  </Text>
                  <ArrowRight size={11} color="#2B2520" strokeWidth={2} />
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF9",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontFamily: "Rexagus",
    color: "#2B2520",
    textTransform: "capitalize",
  },
  divider: {
    width: 36,
    height: 2,
    backgroundColor: "#AE7857",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#A8A29E",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginTop: 12,
  },
  center: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#78716C",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#AE7857",
    borderRadius: 999,
  },
  retryText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#AE7857",
  },
  gridContent: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 48,
  },
  gridRow: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
    alignItems: "flex-start",
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F2EFE9",
  },
  cardPressed: {
    opacity: 0.88,
  },
  cardOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 22,
    paddingBottom: 12,
    backgroundColor: "rgba(43,37,32,0.38)",
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Rexagus",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  cardButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  cardButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2B2520",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});