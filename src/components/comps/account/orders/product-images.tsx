import { Image } from "expo-image";
import { Image as ImageIcon } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const AUTO_SCROLL_MS = 3000;

const ImagePlaceholder = () => (
  <View style={styles.placeholder}>
    <ImageIcon size={24} color="#D6D3D1" strokeWidth={1.5} />
    <Text style={styles.placeholderText}>No image</Text>
  </View>
);

interface ProductImagesProps {
  products?: any[];
}

export default function ProductImages({ products }: ProductImagesProps) {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [width, setWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);

  const count = products?.length || 0;

  useEffect(() => {
    if (count <= 1 || width === 0) return;
    const interval = setInterval(() => {
      const next = (indexRef.current + 1) % count;
      indexRef.current = next;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }, AUTO_SCROLL_MS);
    return () => clearInterval(interval);
  }, [count, width]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w !== width) setWidth(w);
  };

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    indexRef.current = Math.round(e.nativeEvent.contentOffset.x / width);
  };

  const handleImageError = (index: number) =>
    setImageErrors((prev) => ({ ...prev, [index]: true }));

  if (!count) {
    return (
      <View style={styles.wrapper}>
        <ImagePlaceholder />
      </View>
    );
  }

  const renderImage = (item: any, index: number) => {
    if (imageErrors[index] || !item?.imageUrl) return <ImagePlaceholder />;
    return (
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        contentFit="contain"
        transition={150}
        onError={() => handleImageError(index)}
      />
    );
  };

  if (count === 1) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.imageBox}>{renderImage(products![0], 0)}</View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.imageBox} onLayout={handleLayout}>
        {width > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
            scrollEventThrottle={16}
          >
            {products!.map((item, index) => (
              <View key={index} style={{ width }}>
                {renderImage(item, index)}
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  imageBox: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#FAFAF9",
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 5,
  },
  placeholder: {
    height: 144,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAF9",
  },
  placeholderText: {
    marginTop: 4,
    fontSize: 12,
    color: "#D6D3D1",
  },
});