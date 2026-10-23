import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import AppTabs from "@/components/app-tabs";
import AnimatedSplashOverlay from "@/components/comps/animated-splash-overlay";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [splashVisible, setSplashVisible] = useState(true);

  const [fontsLoaded] = useFonts({
    Rexagus: require("../../assets/fonts/Rexagus.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AppTabs />
      {splashVisible && (
        <AnimatedSplashOverlay onFinish={() => setSplashVisible(false)} />
      )}
    </ThemeProvider>
  );
}