import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
}

const Skeleton = ({ width = "100%", height = 16 }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.skeletonBase, { width, height, opacity }]}
    />
  );
};

const WishlistCardSkeleton = () => (
  <View style={styles.cardRow}>
    <Skeleton width={96} height={112} />
    <View style={styles.cardDetails}>
      <Skeleton width={60} height={10} />
      <Skeleton width="80%" height={14} />
      <Skeleton width={80} height={14} />
      <View style={styles.sizesRow}>
        <Skeleton width={32} height={24} />
        <Skeleton width={32} height={24} />
        <Skeleton width={32} height={24} />
      </View>
      <Skeleton width="100%" height={36} />
    </View>
  </View>
);

const WishlistSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Skeleton width={100} height={10} />
            <Skeleton width={160} height={32} />
          </View>
          <View style={styles.headerRight}>
            <Skeleton width={50} height={12} />
            <Skeleton width={60} height={12} />
          </View>
        </View>

        <View>
          {Array.from({ length: 3 }).map((_, i) => (
            <WishlistCardSkeleton key={i} />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: "#F5F5F4",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  content: {
    flexDirection: "column",
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
    gap: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  cardRow: {
    paddingVertical: 20,
    paddingHorizontal: 8,
    flexDirection: "row",
    gap: 16,
  },
  cardDetails: {
    flex: 1,
    gap: 12,
  },
  sizesRow: {
    flexDirection: "row",
    gap: 6,
  },
});

export default WishlistSkeleton;