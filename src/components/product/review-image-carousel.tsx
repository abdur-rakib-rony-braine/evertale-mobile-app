import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Image } from "expo-image";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ASPECT = 4 / 5;
const SLIDE_WIDTH = SCREEN_WIDTH;
const SLIDE_HEIGHT = SLIDE_WIDTH / ASPECT;

interface ReviewImageCarouselProps {
  images: string[];
  selectedImage?: string | null;
  aspectRatio?: "aspect-square" | "aspect-[4/5]";
}

const ReviewImageCarousel = ({
  images,
  selectedImage,
  aspectRatio = "aspect-square",
}: ReviewImageCarouselProps) => {
  const listRef = useRef<FlatList<string>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const height =
    aspectRatio === "aspect-[4/5]" ? SLIDE_HEIGHT : SLIDE_WIDTH;

  useEffect(() => {
    if (!selectedImage || !images?.length) return;
    const index = images.findIndex((img) => img === selectedImage);
    if (index !== -1 && index !== currentIndex) {
      setCurrentIndex(index);
      listRef.current?.scrollToIndex({ index, animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage, images]);

  if (!images || images.length === 0) return null;

  const handleMomentumEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    if (idx !== currentIndex) setCurrentIndex(idx);
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= images.length) return;
    setCurrentIndex(index);
    listRef.current?.scrollToIndex({ index, animated: true });
  };

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={listRef}
        data={images}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        getItemLayout={(_, index) => ({
          length: SLIDE_WIDTH,
          offset: SLIDE_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SLIDE_WIDTH, height }]}>
            <Image
              source={{ uri: item }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}
      />

      {images.length > 1 ? (
        <>
          {currentIndex > 0 ? (
            <Pressable
              onPress={() => goTo(currentIndex - 1)}
              style={[styles.navButton, styles.navLeft]}
              accessibilityLabel="Previous image"
            >
              <ChevronLeft size={20} color="#1F2937" />
            </Pressable>
          ) : null}

          {currentIndex < images.length - 1 ? (
            <Pressable
              onPress={() => goTo(currentIndex + 1)}
              style={[styles.navButton, styles.navRight]}
              accessibilityLabel="Next image"
            >
              <ChevronRight size={20} color="#1F2937" />
            </Pressable>
          ) : null}

          <View style={styles.dotsRow}>
            {images.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => goTo(index)}
                style={[styles.dot, index === currentIndex && styles.dotActive]}
                accessibilityLabel={`Go to image ${index + 1}`}
              />
            ))}
          </View>

          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },

  navButton: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 8,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  navLeft: {
    left: 16,
  },
  navRight: {
    right: 16,
  },

  dotsRow: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#FFFFFF",
  },

  counterBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  counterText: {
    fontSize: 11,
    color: "#FFFFFF",
  },
});

export default ReviewImageCarousel;