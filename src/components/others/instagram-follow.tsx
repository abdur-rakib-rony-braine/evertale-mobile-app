import { LinearGradient } from "expo-linear-gradient";
import { Camera } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { apiClient } from "@/lib/api/client";
import ImageContainer from "@/components/image-container";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PADDING = 16;
const GAP = 8;
const TILE_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP) / 2;

interface InstagramData {
  title: string;
  description?: string;
  images: { _id?: string; src: string }[];
  buttonText: string;
  buttonUrl: string;
}

export default function InstagramFollowSection() {
  const [data, setData] = useState<InstagramData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstagram = async () => {
      try {
        const res = await apiClient.get("/api/instagram-follow");
        if (res.data?.success && res.data.result) {
          setData(res.data.result);
        }
      } catch (error) {
        console.error("Instagram fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstagram();
  }, []);

  const openInstagram = () => {
    if (data?.buttonUrl) Linking.openURL(data.buttonUrl);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#AE7857" />
      </View>
    );
  }

  if (!data || !data.title) return null;

  const titleParts = data.title.split("Instagram");
  const prefix = titleParts[0];
  const suffix = titleParts[1] || "";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Social</Text>
        <Text style={styles.title}>
          {prefix}
          <Text style={styles.instagramGradientText}>Instagram</Text>
          {suffix}
        </Text>
        {data.description ? (
          <Text style={styles.description}>{data.description}</Text>
        ) : null}
      </View>

      {data.images?.length > 0 ? (
        <View style={styles.grid}>
          {data.images.map((image, i) => (
            <Pressable
              key={image._id || i}
              onPress={openInstagram}
              style={({ pressed }) => [
                styles.tile,
                pressed && styles.tilePressed,
              ]}
            >
              <ImageContainer
                uri={image.src}
                backgroundColor="#F2EFE9"
                placeholderText=""
                fallbackAspectRatio={1}
              />
            </Pressable>
          ))}
        </View>
      ) : null}

      {data.buttonUrl ? (
        <View style={styles.footer}>
          <Pressable onPress={openInstagram} style={styles.buttonContainer}>
            <LinearGradient
              colors={["#FD059A", "#9609F7", "#FF006E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Camera size={16} color="#FFFFFF" />
              <Text style={styles.buttonText}>{data.buttonText}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : null}
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
    marginBottom: 24,
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
    fontSize: 24,
    fontFamily: "Rexagus",
    color: "#2B2520",
    marginBottom: 12,
    textAlign: "center",
  },
  instagramGradientText: {
    color: "#FD059A",
  },
  description: {
    fontSize: 14,
    color: "#78716C",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: GAP,
  },
  tile: {
    width: TILE_WIDTH,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#F2EFE9",
  },
  tilePressed: {
    opacity: 0.88,
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  buttonContainer: {
    overflow: "hidden",
    borderRadius: 999,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  loadingContainer: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
});