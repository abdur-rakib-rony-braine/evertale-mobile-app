import { Image, ImageContentFit } from "expo-image";
import { useEffect, useState } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface ImageContainerProps {
  uri?: string | null;
  contentFit?: ImageContentFit;
  backgroundColor?: string;
  placeholderText?: string;
  fallbackAspectRatio?: number;
  adaptToImage?: boolean;
  transition?: number;
  style?: StyleProp<ViewStyle>;
  onError?: () => void;
}

export default function ImageContainer({
  uri,
  contentFit = "contain",
  backgroundColor = "#F2EFE9",
  placeholderText = "No image",
  fallbackAspectRatio = 3 / 4,
  adaptToImage = true,
  transition = 150,
  style,
  onError,
}: ImageContainerProps) {
  const [hasError, setHasError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(fallbackAspectRatio);

  useEffect(() => {
    setHasError(false);
    setAspectRatio(fallbackAspectRatio);
  }, [uri, fallbackAspectRatio]);

  const showImage = !!uri && !hasError;

  return (
    <View
      style={[
        styles.container,
        adaptToImage ? { aspectRatio } : styles.fixed,
        { backgroundColor },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          contentFit={contentFit}
          contentPosition="center"
          transition={transition}
          style={styles.image}
          onLoad={(e) => {
            if (!adaptToImage) return;
            const { width, height } = e.source;
            if (width > 0 && height > 0) setAspectRatio(width / height);
          }}
          onError={() => {
            setHasError(true);
            onError?.();
          }}
        />
      ) : (
        <Text style={styles.placeholderText}>{placeholderText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  fixed: {
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    fontSize: 12,
    color: "#A8A29E",
  },
});