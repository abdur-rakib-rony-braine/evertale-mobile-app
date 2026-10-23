import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface ProductViewCarouselProps {
  images: string[];
  aspectRatio?: number;
  containerWidth?: number;
}

export default function ProductViewCarousel({
  images = [],
  aspectRatio = 3 / 4,
  containerWidth,
}: ProductViewCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<string>>(null);
  
  const slideWidth = containerWidth ?? screenWidth;
  const slideHeight = slideWidth / aspectRatio;

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
      setActiveIndex(index);
    },
    [slideWidth]
  );

  if (!images.length) {
    return (
      <View
        style={[styles.emptyContainer, { width: slideWidth, height: slideHeight }]}
      />
    );
  }

  return (
    <View style={{ width: slideWidth, height: slideHeight }}>
      <FlatList
        ref={listRef}
        data={images}
        keyExtractor={(item, index) => `${index}-${item}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: slideWidth,
          offset: slideWidth * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={{ width: slideWidth, height: slideHeight }}>
            <Image
              source={{ uri: item }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
      />

      {images.length > 1 ? (
        <View style={styles.paginationRow}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    backgroundColor: "#F5F5F4",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  paginationRow: {
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
    width: 20,
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    width: 6,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
});