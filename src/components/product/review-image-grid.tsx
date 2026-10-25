import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { X } from "lucide-react-native";
import type { ProductReview } from "@/lib/api/products";
import ReviewImageCarousel from "./review-image-carousel";
import StarRating from "./star-rating";

interface ReviewImageGridProps {
  review: ProductReview;
  productId?: string;
}

const formatDate = (value?: string) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const ReviewImageGrid = ({ review }: ReviewImageGridProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  if (!review?.images?.length) return null;

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    setOpen(true);
  };

  return (
    <>
      <View style={styles.grid}>
        {review.images.map((item, index) => (
          <Pressable
            key={`${item}-${index}`}
            onPress={() => handleImageClick(item)}
            style={styles.thumbnail}
          >
            <Image
              source={{ uri: item }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </View>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Review Photos</Text>
            <Pressable
              onPress={() => setOpen(false)}
              hitSlop={8}
              style={styles.closeButton}
              accessibilityLabel="Close"
            >
              <X size={18} color="#1C1917" />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.mediaWrapper}>
              <ReviewImageCarousel
                images={review.images}
                selectedImage={selectedImage || review.images[0]}
              />
            </View>

            <View style={styles.detailsBlock}>
              <View style={styles.userRow}>
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
                  <View style={styles.ratingRow}>
                    <StarRating
                      rate={review?.rating || 0}
                      size={13}
                      variant="yellow"
                    />
                    <Text style={styles.dateText}>
                      {formatDate(review?.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>

              {review?.reviewTitle ? (
                <Text style={styles.reviewTitle}>{review.reviewTitle}</Text>
              ) : null}

              {review?.comment ? (
                <Text style={styles.commentText}>{review.comment}</Text>
              ) : null}

              {review.images.length > 1 ? (
                <View>
                  <Text style={styles.allPhotosLabel}>All Photos</Text>
                  <View style={styles.allPhotosGrid}>
                    {review.images.map((item, index) => (
                      <Pressable
                        key={`${item}-all-${index}`}
                        onPress={() => handleImageClick(item)}
                        style={styles.allPhotosThumb}
                      >
                        <Image
                          source={{ uri: item }}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <Text style={styles.photoCount}>
                {review.images.length}{" "}
                {review.images.length === 1 ? "photo" : "photos"} in this review
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    overflow: "hidden",
    backgroundColor: "#FAFAF9",
    borderWidth: 1,
    borderColor: "#F5F5F4",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F5F1",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
    backgroundColor: "#F8F5F1",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1917",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingBottom: 24,
  },

  mediaWrapper: {
    width: "100%",
    backgroundColor: "#F5F5F4",
  },

  detailsBlock: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
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
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    color: "#A8A29E",
  },

  reviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#292524",
    lineHeight: 22,
  },
  commentText: {
    fontSize: 14,
    color: "#78716C",
    lineHeight: 22,
  },

  allPhotosLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#A8A29E",
    marginBottom: 8,
  },
  allPhotosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  allPhotosThumb: {
    width: "23%",
    aspectRatio: 1,
    overflow: "hidden",
    backgroundColor: "#F5F5F4",
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },

  photoCount: {
    fontSize: 12,
    color: "#A8A29E",
  },
});

export default ReviewImageGrid;