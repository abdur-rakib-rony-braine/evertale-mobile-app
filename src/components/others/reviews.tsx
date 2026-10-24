import { Star } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Carousel } from "react-native-reanimated-carousel";

import { apiClient } from "@/lib/api/client";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.8;
const ITEM_HEIGHT = 240;

const AVATAR_COLORS = [
  "#6b4b3e",
  "#ae7857",
  "#57534e",
  "#44403c",
  "#8a6050",
  "#78716c",
];

interface Review {
  _id: string;
  rating: number;
  title?: string;
  content: string;
  author: string;
  location?: string;
}

function Initials({ name = "" }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : name.slice(0, 2);
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{letters.toUpperCase()}</Text>
    </View>
  );
}

function ReviewCard({ item }: { item: Review }) {
  return (
    <View style={styles.card}>
      <View style={styles.starsRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            color={i < item.rating ? "#AE7857" : "#E7E5E4"}
            fill={i < item.rating ? "#AE7857" : "#E7E5E4"}
          />
        ))}
      </View>

      {item.title && <Text style={styles.reviewTitle}>"{item.title}"</Text>}

      <Text style={styles.reviewContent} numberOfLines={4}>
        {item.content}
      </Text>

      <View style={styles.footer}>
        <Initials name={item.author} />
        <View>
          <Text style={styles.authorName}>{item.author}</Text>
          {item.location && (
            <Text style={styles.authorLocation}>{item.location}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await apiClient.get("/api/reviews");
        if (res.data?.data) {
          setReviews(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#AE7857" />
      </View>
    );
  }

  if (!reviews.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>What Our Customers Say</Text>
      <Text style={styles.title}>Client Reviews</Text>
      <Text style={styles.description}>
        Timeless pieces, thoughtfully made — here's what our community has to
        say about Evertale.
      </Text>

      <Carousel
        style={{ width: width, height: ITEM_HEIGHT }}
        data={reviews}
        autoplay={true}
        autoplayInterval={3000}
        loop={true}
        renderItem={({ item }) => <ReviewCard item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: "#A8A29E",
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontFamily: "Rexagus",
    color: "#262626",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#78716C",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 24,
  },
  card: {
    width: ITEM_WIDTH - 16,
    height: ITEM_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 20,
    marginHorizontal: 8,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
    lineHeight: 20,
  },
  reviewContent: {
    fontSize: 13,
    color: "#78716C",
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#FAFAF9",
    paddingTop: 12,
    marginTop: "auto",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  authorName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#292524",
  },
  authorLocation: {
    fontSize: 11,
    color: "#A8A29E",
  },
  loadingContainer: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
});