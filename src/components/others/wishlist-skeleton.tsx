import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
}

const Skeleton = ({ width = "100%", height = 16, radius = 4 }: SkeletonProps) => {
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
      style={[
        styles.skeletonBase,
        { width, height, opacity, borderRadius: radius },
      ]}
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
        <Skeleton width={34} height={26} />
        <Skeleton width={34} height={26} />
        <Skeleton width={34} height={26} />
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

        <View style={styles.list}>
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
    backgroundColor: "#F2EFE9",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 32,
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
    borderBottomColor: "#F2EFE9",
    paddingBottom: 18,
  },
  headerLeft: {
    flex: 1,
    gap: 8,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 8,
  },

  list: {
    gap: 12,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F2EFE9",
    borderRadius: 8,
  },
  cardDetails: {
    flex: 1,
    gap: 10,
  },
  sizesRow: {
    flexDirection: "row",
    gap: 6,
  },
});

export default WishlistSkeleton;