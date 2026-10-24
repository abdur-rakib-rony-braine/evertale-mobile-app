import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import Collections from "./collections";
import { apiClient } from "@/lib/api/client";

export default function CollectionsSection() {
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await apiClient.get("/api/collections?active=true");
        if (res.data) {
          setCollections(res.data.collections || []);
        }
      } catch (error) {
        console.error("Failed to fetch collections", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#AE7857" />
      </View>
    );
  }

  if (!collections.length) return null;

  return <Collections collections={collections} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 420,
    alignItems: "center",
    justifyContent: "center",
  },
});