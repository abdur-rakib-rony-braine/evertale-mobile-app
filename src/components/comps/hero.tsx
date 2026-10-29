import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");
const FALLBACK_RATIO = 3 / 4;

interface Slide {
  _id?: string;
  fileUrl?: string;
  headline?: string;
  slug?: string;
  urlname?: string;
}

interface HeroProps {
  slides?: Slide[];
}

export default function Hero({ slides = [] }: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [ratios, setRatios] = useState<Record<number, number>>({});
  const listRef = useRef<FlatList<Slide>>(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (!slides.length) return;
    listRef.current?.scrollToIndex({ index: activeIndex, animated: true });
  }, [activeIndex, slides.length]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    },
    []
  );

  if (!slides.length) return null;

  const heightFor = (index: number) =>
    width / (ratios[index] ?? FALLBACK_RATIO);

  return (
    <View style={[styles.container, { height: heightFor(activeIndex) }]}>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item, index) => item._id ?? String(index)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <View style={{ width, height: heightFor(index) }}>
            <Image
              source={{ uri: item.fileUrl || "https://placehold.co/1200x1600/png" }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
              onLoad={(e) => {
                const { width: w, height: h } = e.source;
                if (w > 0 && h > 0) {
                  setRatios((prev) =>
                    prev[index] === w / h ? prev : { ...prev, [index]: w / h }
                  );
                }
              }}
            />
          </View>
        )}
      />

      {slides.length > 1 && (
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    width: 6,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});