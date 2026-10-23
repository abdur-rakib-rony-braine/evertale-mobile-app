import { useEffect } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.4;

interface AnimatedSplashOverlayProps {
  onFinish?: () => void;
}

export default function AnimatedSplashOverlay({
  onFinish,
}: AnimatedSplashOverlayProps) {
  const containerOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    logoScale.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.back(1.5)),
    });

    textOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    containerOpacity.value = withDelay(
      1800,
      withSequence(
        withTiming(0, {
          duration: 500,
          easing: Easing.in(Easing.cubic),
        })
      )
    );

    const timeout = setTimeout(() => {
      if (onFinish) {
        runOnJS(onFinish)();
      }
    }, 2400);

    return () => clearTimeout(timeout);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, containerStyle]}
    >
      <Animated.View style={logoStyle}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={textStyle}>
        <Text style={styles.tagline}>Timeless fashion, delivered</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  tagline: {
    marginTop: 20,
    fontSize: 14,
    letterSpacing: 2,
    color: "#AE7857",
    textTransform: "uppercase",
  },
});