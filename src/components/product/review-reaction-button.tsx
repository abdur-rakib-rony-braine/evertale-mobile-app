import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ThumbsDown, ThumbsUp } from "lucide-react-native";
import Toast from "react-native-toast-message";

import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";
import type { ProductReview } from "@/lib/api/products";

interface ReviewReactionButtonProps {
  review: ProductReview;
  productId: string;
}

type Reaction = "like" | "dislike";

const BRAND = "#AE7857";

const showError = (message: string) =>
  Toast.show({ type: "error", text1: message });

const ReviewReactionButton = ({
  review,
  productId,
}: ReviewReactionButtonProps) => {
  const userId = useAuthStore((s) => s.user?._id ?? null);

  const [likes, setLikes] = useState<string[]>(
    (review?.likes || []).map((l) => String(l.userId))
  );
  const [dislikes, setDislikes] = useState<string[]>(
    (review?.dislikes || []).map((d) => String(d.userId))
  );
  const [isLoading, setIsLoading] = useState(false);

  const isLiked = !!userId && likes.includes(userId);
  const isDisliked = !!userId && dislikes.includes(userId);

  const handleReaction = async (type: Reaction) => {
    if (isLoading) return;

    if (!userId) {
      showError("Please log in to react to reviews");
      return;
    }

    if (!review?._id) {
      showError("Review unavailable");
      return;
    }

    setIsLoading(true);

    const prevLikes = likes;
    const prevDislikes = dislikes;

    // optimistic update
    if (type === "like") {
      if (isLiked) {
        setLikes(likes.filter((id) => id !== userId));
      } else {
        setLikes([...likes, userId]);
        if (isDisliked) setDislikes(dislikes.filter((id) => id !== userId));
      }
    } else {
      if (isDisliked) {
        setDislikes(dislikes.filter((id) => id !== userId));
      } else {
        setDislikes([...dislikes, userId]);
        if (isLiked) setLikes(likes.filter((id) => id !== userId));
      }
    }

    try {
      const { data } = await apiClient.post("/api/review/react", {
        reviewId: review._id,
        productId,
        type,
      });

      if (data?.review) {
        setLikes((data.review.likes || []).map((l: any) => String(l.userId)));
        setDislikes(
          (data.review.dislikes || []).map((d: any) => String(d.userId))
        );
      }
    } catch (error: any) {
      // rollback
      setLikes(prevLikes);
      setDislikes(prevDislikes);
      showError(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to update reaction"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => handleReaction("like")}
        disabled={isLoading}
        accessibilityLabel={isLiked ? "Unlike review" : "Like review"}
        style={styles.button}
      >
        <ThumbsUp
          size={14}
          strokeWidth={2}
          color={isLiked ? BRAND : "#A8A29E"}
          fill={isLiked ? BRAND : "transparent"}
        />
        <Text style={[styles.count, isLiked && styles.countActive]}>
          {likes.length}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handleReaction("dislike")}
        disabled={isLoading}
        accessibilityLabel={isDisliked ? "Remove dislike" : "Dislike review"}
        style={styles.button}
      >
        <ThumbsDown
          size={14}
          strokeWidth={2}
          color={isDisliked ? "#78716C" : "#A8A29E"}
          fill={isDisliked ? "#78716C" : "transparent"}
        />
        <Text style={[styles.count, isDisliked && styles.countDisliked]}>
          {dislikes.length}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  count: {
    fontSize: 12,
    color: "#A8A29E",
    fontVariant: ["tabular-nums"],
  },
  countActive: {
    color: BRAND,
  },
  countDisliked: {
    color: "#78716C",
  },
});

export default ReviewReactionButton;