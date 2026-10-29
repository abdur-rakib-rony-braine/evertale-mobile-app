import { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import {
  fetchPromotionalBanner,
  PromoBanner,
} from "@/lib/api/promotional-banner";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function PromotionalBanner() {
  const router = useRouter();
  const [banner, setBanner] = useState<PromoBanner | null | undefined>(
    undefined
  );
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [ratio, setRatio] = useState<number | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchPromotionalBanner();
        if (!cancelled) setBanner(data);
      } catch {
        if (!cancelled) setBanner(null);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!banner) return;

    const update = () => {
      const now = Date.now();
      const end = new Date(banner.endDate).getTime();

      if (now < end) {
        const distance = end - now;
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setBanner(null);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [banner]);

  if (banner === undefined) return null;
  if (banner === null) return null;

  const timeUnits = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINUTES", value: timeLeft.minutes },
    { label: "SECONDS", value: timeLeft.seconds },
  ];

  const imageHeight = ratio ? SCREEN_WIDTH / ratio : 0;
  const height = Math.max(imageHeight, contentHeight);

  return (
    <View
      style={[styles.bg, height > 0 ? { height } : null]}
    >
      <Image
        source={{ uri: banner.imageUrl }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        style={StyleSheet.absoluteFill}
        onLoad={(e) => {
          const { width: w, height: h } = e.source;
          if (w > 0 && h > 0) setRatio(w / h);
        }}
      />

      <View
        style={styles.content}
        onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
      >
        {banner.title ? (
          <Text style={styles.title}>{banner.title}</Text>
        ) : null}

        <Text style={styles.subtitle}>Give Gift to Your liked!</Text>

        {banner.displayCountdown !== false ? (
          <View style={styles.timerContainer}>
            {timeUnits.map((unit, index) => (
              <View key={unit.label} style={styles.timerUnitRow}>
                <View style={styles.timerBox}>
                  <Text style={styles.timerValue}>
                    {String(unit.value).padStart(2, "0")}
                  </Text>
                  <View style={styles.timerDivider} />
                  <Text style={styles.timerLabel}>{unit.label}</Text>
                </View>

                {index < timeUnits.length - 1 ? (
                  <View style={styles.timerDots}>
                    <Text style={styles.timerDotText}>•</Text>
                    <Text style={styles.timerDotText}>•</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        <Pressable
          onPress={() => router.push((banner.link || "/") as any)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>SHOP NOW</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    width: "100%",
    overflow: "hidden",
    justifyContent: "center",
    backgroundColor: "#F2EFE9",
  },
  content: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
    textTransform: "capitalize",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#1F1F1F",
    marginBottom: 24,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  timerUnitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerBox: {
    backgroundColor: "#262626",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  timerValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  timerDivider: {
    marginVertical: 6,
    height: 1,
    width: 24,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.8)",
  },
  timerDots: {
    marginHorizontal: 8,
  },
  timerDotText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#AE7857",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});