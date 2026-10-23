import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import Hero from "@/components/comps/hero";
import { Banner, fetchBanners } from "@/lib/api/banners";

const PLACEHOLDER_HEIGHT = 400;

export default function HeroContainer() {
  const [slides, setSlides] = useState<Banner[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { mobileBanner } = await fetchBanners();
        if (!cancelled) setSlides(mobileBanner);
      } catch (err) {
        if (!cancelled) setSlides([]);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (slides === null) {
    return <View style={styles.placeholder} />;
  }

  if (!slides.length) return null;

  return <Hero slides={slides} />;
}

const styles = StyleSheet.create({
  placeholder: {
    width: "100%",
    height: PLACEHOLDER_HEIGHT,
    backgroundColor: "#F5F5F4",
  },
});