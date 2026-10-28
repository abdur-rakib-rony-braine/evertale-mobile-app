import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Camera, CheckCircle2, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";
import StarRating from "./star-rating";
import { Image } from "expo-image";

interface AddReviewProps {
  productId: string;
  onSuccess?: (review?: any) => void;
}

interface FormState {
  name: string;
  email: string;
  reviewTitle: string;
  comment: string;
}

interface PreviewImage {
  uri: string;
  fileName?: string;
  mimeType?: string;
}

const MAX_IMAGES = 5;

const showSuccess = (message: string) =>
  Toast.show({ type: "success", text1: message });

const showError = (message: string) =>
  Toast.show({ type: "error", text1: message });

const AddReview = ({ productId, onSuccess }: AddReviewProps) => {
  const user = useAuthStore((s) => s.user);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    reviewTitle: "",
    comment: "",
  });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.firstName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!showSuccessMessage) return;
    const timer = setTimeout(() => {
      setShowSuccessMessage(false);
      if (onSuccess) onSuccess();
    }, 3000);
    return () => clearTimeout(timer);
  }, [showSuccessMessage, onSuccess]);

  const handleFieldChange = (key: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePickImages = async () => {
    if (previewImages.length >= MAX_IMAGES) {
      showError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showError("Please allow photo access to add images");
      return;
    }

    const remaining = MAX_IMAGES - previewImages.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (result.canceled) return;

    const next = result.assets.slice(0, remaining).map((asset) => ({
      uri: asset.uri,
      fileName: asset.fileName || `review-${Date.now()}.jpg`,
      mimeType: asset.mimeType || "image/jpeg",
    }));

    setPreviewImages((prev) => [...prev, ...next]);
  };

  const removeImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      name: user?.firstName || "",
      email: user?.email || "",
      reviewTitle: "",
      comment: "",
    });
    setRating(0);
    setPreviewImages([]);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const effectiveEmail = user?.email || formData.email;
    const effectiveName = user?.firstName || formData.name;

    if (
      !effectiveName ||
      !effectiveEmail ||
      !rating ||
      !formData.reviewTitle ||
      !formData.comment
    ) {
      showError("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      let uploadedUrls: string[] = [];

      if (previewImages.length > 0) {
        const formDataImages = new FormData();

        previewImages.forEach((img) => {
          formDataImages.append("reviewImages", {
            uri: img.uri,
            name: img.fileName,
            type: img.mimeType,
          } as any);
        });

        const { data: uploadData } = await apiClient.post(
          "/api/review/upload-review-images",
          formDataImages,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (!uploadData?.success) throw new Error("Failed to upload images");
        uploadedUrls = uploadData.urls || [];
      }

      const { data } = await apiClient.post("/api/review/add-review", {
        productId,
        reviewData: {
          userName: effectiveName,
          userEmail: effectiveEmail,
          reviewTitle: formData.reviewTitle,
          userAvatar: user?.profilePicture || null,
          comment: formData.comment,
          rating,
          images: uploadedUrls,
        },
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to submit review");
      }

      showSuccess("Review submitted successfully");
      resetForm();
      setShowSuccessMessage(true);

      if (onSuccess) onSuccess(data.review);
    } catch (error: any) {
      showError(
        error?.response?.data?.message ||
          error?.message ||
          "Review submission failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccessMessage) {
    return (
      <View style={styles.successWrapper}>
        <View style={styles.successBox}>
          <CheckCircle2 size={20} color="#16A34A" />
          <View style={styles.successTextBlock}>
            <Text style={styles.successTitle}>
              Thank you for your review!
            </Text>
            <Text style={styles.successBody}>
              Your review has been submitted and is awaiting approval. Once
              approved, it will appear on this product page.
            </Text>
          </View>
          <Pressable
            onPress={() => {
              setShowSuccessMessage(false);
              if (onSuccess) onSuccess();
            }}
            hitSlop={8}
            accessibilityLabel="Dismiss"
          >
            <X size={14} color="#22C55E" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.rowFields}>
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            value={formData.name}
            onChangeText={(v) => handleFieldChange("name", v)}
            placeholder="Your name"
            placeholderTextColor="#A8A29E"
            editable={!user?.firstName}
            style={[
              styles.input,
              !!user?.firstName && styles.inputDisabled,
            ]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            value={formData.email}
            onChangeText={(v) => handleFieldChange("email", v)}
            placeholder="Your email"
            placeholderTextColor="#A8A29E"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!user?.email}
            style={[styles.input, !!user?.email && styles.inputDisabled]}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Rating *</Text>
        <StarRating
          rate={hoverRating || rating}
          size={26}
          variant="yellow"
        />
        <View style={styles.ratingButtonsRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={value}
              onPress={() => setRating(value)}
              onPressIn={() => setHoverRating(value)}
              onPressOut={() => setHoverRating(0)}
              style={[
                styles.ratingButton,
                rating === value && styles.ratingButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.ratingButtonText,
                  rating === value && styles.ratingButtonTextActive,
                ]}
              >
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Review Title *</Text>
        <TextInput
          value={formData.reviewTitle}
          onChangeText={(v) => handleFieldChange("reviewTitle", v)}
          placeholder="Give your review a title"
          placeholderTextColor="#A8A29E"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Your Experience *</Text>
        <TextInput
          value={formData.comment}
          onChangeText={(v) => handleFieldChange("comment", v)}
          placeholder="Share your experience with this product..."
          placeholderTextColor="#A8A29E"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={[styles.input, styles.textarea]}
        />
      </View>

      {previewImages.length > 0 ? (
        <View style={styles.previewRow}>
          {previewImages.map((image, index) => (
            <View key={`${image.uri}-${index}`} style={styles.previewItem}>
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
              <Pressable
                onPress={() => removeImage(index)}
                style={styles.previewRemove}
                hitSlop={4}
                accessibilityLabel="Remove image"
              >
                <X size={11} color="#1C1917" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <Pressable onPress={handlePickImages} style={styles.photoButton}>
          <Camera size={13} color="#44403C" />
          <Text style={styles.photoButtonText}>Add Photo</Text>
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
  },

  rowFields: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#57534E",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1C1917",
    backgroundColor: "#FFFFFF",
    height: 40,
  },
  textarea: {
    height: 120,
    paddingTop: 10,
  },
  inputDisabled: {
    backgroundColor: "#FAFAF9",
    color: "#A8A29E",
  },

  ratingButtonsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  ratingButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingButtonActive: {
    backgroundColor: "#1C1917",
    borderColor: "#1C1917",
  },
  ratingButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#57534E",
  },
  ratingButtonTextActive: {
    color: "#FFFFFF",
  },

  previewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  previewItem: {
    width: 96,
    height: 96,
    backgroundColor: "#F5F5F4",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    marginTop: 4,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#D6D3D1",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  photoButtonText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#44403C",
  },
  submitButton: {
    backgroundColor: "#1C1917",
    paddingHorizontal: 24,
    paddingVertical: 10,
    minWidth: 140,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#FFFFFF",
  },

  successWrapper: {
    padding: 24,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  successTextBlock: {
    flex: 1,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 2,
  },
  successBody: {
    fontSize: 14,
    color: "#15803D",
    lineHeight: 20,
  },
});

export default AddReview;