import { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  center?: boolean;
}

const Skeleton = ({ width = "100%", height = 16, center }: SkeletonProps) => {
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
        { width, height, opacity },
        center && styles.center,
      ]}
    />
  );
};

const CartSkeleton = () => (
  <ScrollView
    style={styles.scroll}
    contentContainerStyle={styles.scrollContent}
    scrollEnabled={false}
  >
    <View style={styles.header}>
      <Skeleton width={96} height={12} />
      <Skeleton width={64} height={32} />
      <Skeleton width={48} height={12} />
    </View>

    <View style={styles.list}>
      {[1, 2].map((i) => (
        <View key={i} style={styles.card}>
          <Skeleton width={96} height={144} />
          <View style={styles.cardMiddle}>
            <Skeleton width="80%" height={16} />
            <Skeleton width={64} height={12} />
            <Skeleton width={80} height={16} />
            <View style={styles.stepperRow}>
              <Skeleton width={28} height={28} />
              <Skeleton width={32} height={28} />
              <Skeleton width={28} height={28} />
            </View>
          </View>
          <View style={styles.cardRight}>
            <Skeleton width={16} height={16} />
            <Skeleton width={16} height={16} />
          </View>
        </View>
      ))}
    </View>

    <View style={styles.summary}>
      <Skeleton width={112} height={12} />
      <View style={styles.summaryRows}>
        <View style={styles.summaryRow}>
          <Skeleton width={128} height={12} />
          <Skeleton width={56} height={12} />
        </View>
        <View style={styles.summaryRow}>
          <Skeleton width={112} height={12} />
          <Skeleton width={56} height={12} />
        </View>
      </View>
      <Skeleton width="100%" height={1} />
      <View style={styles.summaryRow}>
        <Skeleton width={48} height={16} />
        <Skeleton width={64} height={16} />
      </View>
      <Skeleton width={160} height={12} />
      <Skeleton width="100%" height={44} />
      <Skeleton width={128} height={12} center />
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: "#F5F5F4",
  },
  center: {
    alignSelf: "center",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "#FAF6F1",
    padding: 16,
  },
  cardMiddle: {
    flex: 1,
    gap: 10,
  },
  stepperRow: {
    flexDirection: "row",
    gap: 8,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 12,
  },
  summary: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 24,
    gap: 16,
  },
  summaryRows: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default CartSkeleton;