import { Image, StyleSheet, Text, View } from "react-native";
import type { ProductReview } from "@/lib/api/products";
import StarRating from "./star-rating";
import ReviewImageGrid from "./review-image-grid";
import ReviewReactionButton from "./review-reaction-button";
import ReviewMessage from "./review-message";

interface ReviewCardProps {
  review: ProductReview;
  productId: string;
}

const maskEmail = (email?: string) => {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(name.length - 2, 0))}@${domain}`;
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const ReviewCard = ({ review, productId }: ReviewCardProps) => {
  const formattedDate = formatDate(review?.createdAt);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.userBlock}>
          <View style={styles.avatar}>
            {review?.userAvatar ? (
              <Image
                source={{ uri: review.userAvatar }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarFallback}>
                {(review?.userName || "U").charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{review?.userName}</Text>
            <Text style={styles.userEmail}>{maskEmail(review?.userEmail)}</Text>
            <StarRating
              rate={review?.rating || 0}
              size={13}
              variant="yellow"
            />
          </View>
        </View>

        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>

      <View style={styles.contentBlock}>
        {review?.reviewTitle ? (
          <Text style={styles.reviewTitle}>{review.reviewTitle}</Text>
        ) : null}
        <Text style={styles.commentText}>{review?.comment}</Text>
      </View>

      <View style={styles.footerRow}>
        <ReviewImageGrid review={review} productId={productId} />
        <View style={styles.actionsRow}>
          <ReviewMessage />
          <ReviewReactionButton review={review} productId={productId} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    width: "100%",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  userBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flexShrink: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F4",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    fontSize: 16,
    fontWeight: "600",
    color: "#78716C",
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
    lineHeight: 18,
  },
  userEmail: {
    fontSize: 12,
    color: "#A8A29E",
  },
  dateText: {
    fontSize: 12,
    color: "#A8A29E",
    flexShrink: 0,
  },

  contentBlock: {
    marginTop: 16,
    paddingLeft: 52,
    gap: 4,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
  },
  commentText: {
    fontSize: 14,
    color: "#78716C",
    lineHeight: 22,
  },

  footerRow: {
    marginTop: 16,
    paddingLeft: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: "auto",
  },
});

export default ReviewCard;