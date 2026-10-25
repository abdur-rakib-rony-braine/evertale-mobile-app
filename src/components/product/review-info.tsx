import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CheckCircle2, ChevronDown, X } from "lucide-react-native";

import ReviewCard from "./review-card";
import type { Product, ProductReview } from "@/lib/api/products";
import AddReview from "./add-review";

type SortBy = "newest" | "oldest" | "highest" | "lowest";

interface ReviewInfoProps {
  product: Product;
  showAddReview: boolean;
  setShowAddReview: (value: boolean) => void;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
];

const ReviewInfo = ({
  product,
  showAddReview,
  setShowAddReview,
}: ReviewInfoProps) => {
  const approvedReviews = useMemo<ProductReview[]>(
    () => (product?.reviews || []).filter((r) => r.approved),
    [product]
  );

  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!reviewSubmitted) return;
    const timer = setTimeout(() => setReviewSubmitted(false), 5000);
    return () => clearTimeout(timer);
  }, [reviewSubmitted]);

  const handleReviewSuccess = () => {
    setReviewSubmitted(true);
    setShowAddReview(false);
  };

  const sortedReviews = useMemo(() => {
    return [...approvedReviews].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        case "highest":
          return (b.rating || 0) - (a.rating || 0);
        case "lowest":
          return (a.rating || 0) - (b.rating || 0);
        default:
          return 0;
      }
    });
  }, [approvedReviews, sortBy]);

  const activeLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Sort by";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Reviews</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{approvedReviews.length}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => setSortOpen((prev) => !prev)}
          style={styles.sortTrigger}
        >
          <Text style={styles.sortTriggerText}>{activeLabel}</Text>
          <ChevronDown size={14} color="#78716C" />
        </Pressable>
      </View>

      {sortOpen ? (
        <View style={styles.sortDropdown}>
          {SORT_OPTIONS.map((option) => {
            const active = option.value === sortBy;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  setSortBy(option.value);
                  setSortOpen(false);
                }}
                style={[styles.sortOption, active && styles.sortOptionActive]}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    active && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {reviewSubmitted ? (
        <View style={styles.successBanner}>
          <CheckCircle2 size={16} color="#16A34A" />
          <Text style={styles.successText}>
            Thank you for your review! It will be visible once approved by our
            team.
          </Text>
          <Pressable
            onPress={() => setReviewSubmitted(false)}
            hitSlop={8}
            accessibilityLabel="Dismiss"
          >
            <X size={14} color="#16A34A" />
          </Pressable>
        </View>
      ) : null}

      {showAddReview ? (
        <View style={styles.addReviewWrapper}>
          <AddReview
            productId={product?._id}
            onSuccess={handleReviewSuccess}
          />
        </View>
      ) : null}

      <View style={styles.list}>
        {sortedReviews.map((review, index) => (
          <ReviewCard
            key={review._id || `${review.userEmail}-${index}`}
            review={review}
            productId={product?._id}
          />
        ))}

        {sortedReviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No reviews yet — be the first to share your thoughts.
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
    letterSpacing: 0.3,
  },
  countBadge: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FAFAF9",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    fontSize: 12,
    color: "#A8A29E",
  },

  sortTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 12,
    height: 32,
    minWidth: 140,
  },
  sortTriggerText: {
    fontSize: 12,
    color: "#1C1917",
    flex: 1,
  },

  sortDropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-end",
    minWidth: 160,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sortOptionActive: {
    backgroundColor: "#FAFAF9",
  },
  sortOptionText: {
    fontSize: 12,
    color: "#57534E",
  },
  sortOptionTextActive: {
    color: "#1C1917",
    fontWeight: "600",
  },

  successBanner: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: "#15803D",
    lineHeight: 20,
  },

  addReviewWrapper: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#F5F5F4",
  },

  list: {
    marginTop: 24,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#A8A29E",
    textAlign: "center",
  },
});

export default ReviewInfo;