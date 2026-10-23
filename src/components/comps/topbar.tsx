import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const messages = [
  "Shop with Confidence — 30 Day Returns & Exchanges",
  "Timeless Pieces, Thoughtfully Made",
  "An Elevated Experience, Thoughtfully Delivered",
];

export default function Topbar() {
  const [index, setIndex] = useState(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const interval = setInterval(() => {
      opacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        opacity.value = withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
      }, 320);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Animated.View style={animatedStyle}>
          <Text numberOfLines={1} style={styles.text}>
            {messages[index]}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#AE7857",
    paddingVertical: 8,
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.88,
    textTransform: "uppercase",
    color: "#FFFFFF",
    textAlign: "center",
  },
});