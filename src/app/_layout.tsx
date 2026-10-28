import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AnimatedSplashOverlay from "@/components/comps/animated-splash-overlay";
import Toast from "react-native-toast-message";
import toastConfig from "@/components/comps/toast-config";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashVisible, setSplashVisible] = useState(true);

  const [fontsLoaded] = useFonts({
    Rexagus: require("../../assets/fonts/Rexagus.ttf"),
  });

  const loadSession = useAuthStore((s) => s.loadSession);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const userId = useAuthStore((s) => s.user?._id ?? null);

  useEffect(() => {
    if (fontsLoaded) {
      loadSession().then(() => {
        SplashScreen.hideAsync();
      });
    }
  }, [fontsLoaded, loadSession]);

  useEffect(() => {
    if (!isInitialized) return;
    useCartStore.getState().onSessionChange(userId);
    useWishlistStore.getState().onSessionChange(userId);
  }, [isInitialized, userId]);

  if (!fontsLoaded || !isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
          {splashVisible && (
            <AnimatedSplashOverlay onFinish={() => setSplashVisible(false)} />
          )}
          <Toast config={toastConfig} position="top" />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}