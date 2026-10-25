import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react-native";
import { productToWishlistItem } from "@/lib/wishlist-item";
import type { Product } from "@/lib/api/products";
import WishlistButton from "../comps/wishlist-button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_ASPECT = 4 / 5;
const SLIDE_WIDTH = SCREEN_WIDTH;
const SLIDE_HEIGHT = SLIDE_WIDTH / SLIDE_ASPECT;

const isVideoFile = (url?: string) => {
  if (!url) return false;
  const exts = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
  return exts.some((ext) => url.toLowerCase().includes(ext));
};

interface ProductMediaGridProps {
  media: string[];
  videoThumbnail?: string;
  product: Product;
}

const ProductMediaGrid = ({
  media,
  videoThumbnail,
  product,
}: ProductMediaGridProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lightboxListRef = useRef<FlatList<string>>(null);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    if (index !== activeIndex) setActiveIndex(index);
  };

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToLightboxIndex = useCallback((index: number) => {
    setLightboxIndex(index);
    lightboxListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const renderMedia = useCallback(
    (item: string, index: number) => {
      const isVideo = isVideoFile(item);
      const uri = isVideo ? videoThumbnail : item;

      return (
        <Pressable
          onPress={() => openLightbox(index)}
          style={[styles.slide, { height: SLIDE_HEIGHT }]}
        >
          {uri ? (
            <Image source={{ uri }} style={styles.slideImage} resizeMode="cover" />
          ) : (
            <View style={styles.slidePlaceholder} />
          )}

          {isVideo ? (
            <View style={styles.playOverlay} pointerEvents="none">
              <View style={styles.playCircle}>
                <Play size={22} color="#111827" fill="#111827" />
              </View>
            </View>
          ) : null}
        </Pressable>
      );
    },
    [videoThumbnail, openLightbox]
  );

  if (!media?.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.wishlistWrap}>
        <View style={styles.wishlistCircle}>
          <WishlistButton item={productToWishlistItem(product)} />
        </View>
      </View>

      <FlatList
        data={media}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item, index }) => renderMedia(item, index)}
      />

      {media.length > 1 ? (
        <View style={styles.dotsRow} pointerEvents="none">
          {media.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}

      <Modal
        visible={lightboxOpen}
        animationType="fade"
        transparent
        onRequestClose={closeLightbox}
      >
        <View style={styles.lightboxContainer}>
          {lightboxOpen ? (
            <FlatList
              ref={lightboxListRef}
              data={media}
              keyExtractor={(_, i) => `lightbox-${i}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={lightboxIndex}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_WIDTH
                );
                setLightboxIndex(idx);
              }}
              renderItem={({ item }) => {
                const isVideo = isVideoFile(item);
                const uri = isVideo ? videoThumbnail : item;

                return (
                  <ScrollView
                    minimumZoomScale={1}
                    maximumZoomScale={3}
                    centerContent
                    contentContainerStyle={styles.lightboxSlide}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                  >
                    {uri ? (
                      <Image
                        source={{ uri }}
                        style={styles.lightboxImage}
                        resizeMode="contain"
                      />
                    ) : null}
                  </ScrollView>
                );
              }}
            />
          ) : null}

          <Pressable
            onPress={closeLightbox}
            style={styles.lightboxClose}
            hitSlop={12}
            accessibilityLabel="Close gallery"
          >
            <X size={22} color="#FFFFFF" />
          </Pressable>

          {lightboxOpen && media.length > 1 ? (
            <View style={styles.lightboxNav}>
              <Pressable
                onPress={() => goToLightboxIndex(lightboxIndex - 1)}
                disabled={lightboxIndex === 0}
                style={[
                  styles.lightboxNavButton,
                  lightboxIndex === 0 && styles.lightboxNavDisabled,
                ]}
              >
                <ChevronLeft size={22} color="#FFFFFF" />
              </Pressable>

              <Text style={styles.lightboxCounter}>
                {lightboxIndex + 1} / {media.length}
              </Text>

              <Pressable
                onPress={() => goToLightboxIndex(lightboxIndex + 1)}
                disabled={lightboxIndex === media.length - 1}
                style={[
                  styles.lightboxNavButton,
                  lightboxIndex === media.length - 1 &&
                    styles.lightboxNavDisabled,
                ]}
              >
                <ChevronRight size={22} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
    backgroundColor: "#F2EFE9",
  },
  wishlistWrap: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 10,
  },
  wishlistCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  slide: {
    width: SLIDE_WIDTH,
    backgroundColor: "#F2EFE9",
  },
  slideImage: {
    width: "100%",
    height: "100%",
  },
  slidePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E7E5E4",
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 12,
    borderRadius: 999,
  },

  dotsRow: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(209,213,219,1)",
  },
  dotActive: {
    backgroundColor: "#000000",
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  lightboxContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  lightboxClose: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 20,
    padding: 6,
  },
  lightboxSlide: {
    width: SCREEN_WIDTH,
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH / SLIDE_ASPECT,
  },
  lightboxNav: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    zIndex: 20,
  },
  lightboxNavButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  lightboxNavDisabled: {
    opacity: 0.3,
  },
  lightboxCounter: {
    color: "#FFFFFF",
    fontSize: 13,
    letterSpacing: 1,
  },
});

export default ProductMediaGrid;