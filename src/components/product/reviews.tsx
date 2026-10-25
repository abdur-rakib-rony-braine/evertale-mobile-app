import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FilePenLine } from "lucide-react-native";
import type { Product, ProductReview } from "@/lib/api/products";
import StarRating from "./star-rating";
import ReviewInfo from "./review-info";

interface ReviewsProps {
  product: Product;
}

const Reviews = ({ product }: ReviewsProps) => {
  const [showAddReview, setShowAddReview] = useState(false);

  const approvedReviews = useMemo<ProductReview[]>(() => {
    return (product?.reviews || []).filter((r) => r.approved);
  }, [product]);

  const approvedRatingsCount = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    approvedReviews.forEach((review) => {
      const rating = Math.floor(Number(review.rating) || 0);
      if (rating >= 1 && rating <= 5) {
        counts[rating] = (counts[rating] || 0) + 1;
      }
    });
    return counts;
  }, [approvedReviews]);

  const approvedOverallRating = useMemo(() => {
    if (approvedReviews.length === 0) return 0;
    const sum = approvedReviews.reduce(
      (total, review) => total + (Number(review.rating) || 0),
      0
    );
    return (sum / approvedReviews.length).toFixed(1);
  }, [approvedReviews]);

  return (
    <View style={styles.container}>
      <View style={styles.summaryBlock}>
        <View style={styles.summaryGrid}>
          <View style={styles.overallColumn}>
            <View style={styles.ratingRow}>
              <Text style={styles.overallNumber}>{approvedOverallRating}</Text>
              <Text style={styles.overallDenom}>/5</Text>
            </View>
            <StarRating
              rate={Number(approvedOverallRating) || 0}
              size={18}
              variant="yellow"
            />
            <Text style={styles.basedOn}>
              Based on {approvedReviews.length}{" "}
              {approvedReviews.length === 1 ? "review" : "reviews"}
            </Text>
          </View>

          <View style={styles.breakdownColumn}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = approvedRatingsCount[rating] || 0;
              const percentage =
                approvedReviews.length > 0
                  ? (count / approvedReviews.length) * 100
                  : 0;

              return (
                <View key={rating} style={styles.breakdownRow}>
                  <StarRating rate={rating} size={12} variant="dark" />
                  <View style={styles.progressTrack}>
                    <View
                      style={[styles.progressFill, { width: `${percentage}%` }]}
                    />
                  </View>
                  <Text style={styles.countText}>{count}</Text>
                </View>
              );
            })}
          </View>

          <Pressable
            onPress={() => setShowAddReview((prev) => !prev)}
            style={styles.writeButton}
          >
            <FilePenLine size={13} color="#1C1917" />
            <Text style={styles.writeButtonText}>Write a Review</Text>
          </Pressable>
        </View>
      </View>

      <ReviewInfo
        product={{ ...product, reviews: approvedReviews }}
        showAddReview={showAddReview}
        setShowAddReview={setShowAddReview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  summaryBlock: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
    paddingBottom: 32,
    marginBottom: 32,
  },
  summaryGrid: {
    gap: 24,
  },

  overallColumn: {
    alignItems: "center",
    gap: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  overallNumber: {
    fontSize: 48,
    fontWeight: "600",
    color: "#1C1917",
    lineHeight: 52,
  },
  overallDenom: {
    fontSize: 14,
    color: "#A8A29E",
  },
  basedOn: {
    fontSize: 12,
    color: "#A8A29E",
    marginTop: 4,
  },

  breakdownColumn: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#F5F5F4",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1C1917",
  },
  countText: {
    fontSize: 12,
    color: "#A8A29E",
    width: 20,
    textAlign: "right",
  },

  writeButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#1C1917",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  writeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#1C1917",
  },
});

export default Reviews;