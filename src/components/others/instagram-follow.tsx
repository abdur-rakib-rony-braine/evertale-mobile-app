import { LinearGradient } from "expo-linear-gradient";
import { Camera } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { apiClient } from "@/lib/api/client";
import { Image } from "expo-image";

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
        {data.description && (
          <Text style={styles.description}>{data.description}</Text>
        )}
      </View>

      {data.images?.length > 0 && (
        <View style={styles.grid}>
          {data.images.map((image, i) => (
            <Pressable
              key={image._id || i}
              style={styles.imageWrapper}
              onPress={() => Linking.openURL(data.buttonUrl)}
            >
              <Image
                source={{ uri: image.src }}
                style={styles.image}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </View>
      )}

      {data.buttonUrl && (
        <View style={styles.footer}>
          <Pressable
            onPress={() => Linking.openURL(data.buttonUrl)}
            style={styles.buttonContainer}
          >
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
      )}
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
    color: "#292524",
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
    justifyContent: "space-between",
    gap: 8,
  },
  imageWrapper: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#F5F5F4",
  },
  image: {
    width: "100%",
    height: "100%",
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