import { StyleSheet, View } from "react-native";
import { Star } from "lucide-react-native";

interface StarRatingProps {
  rate?: number | string;
  size?: number;
  variant?: "dark" | "yellow";
  color?: string;
  emptyColor?: string;
  max?: number;
}

const StarRating = ({
  rate = 0,
  size = 14,
  variant = "dark",
  color,
  emptyColor,
  max = 5,
}: StarRatingProps) => {
  const numeric = Number(rate) || 0;

  const filledColor =
    color ?? (variant === "yellow" ? "#FACC15" : "#1C1917");
  const unfilledColor =
    emptyColor ?? (variant === "yellow" ? "#E7E5E4" : "#D6D3D1");
  const strokeWidth = variant === "yellow" ? 1.4 : 1.6;

  return (
    <View style={styles.row}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(numeric);
        return (
          <Star
            key={i}
            size={size}
            color={filled ? filledColor : unfilledColor}
            fill={filled ? filledColor : "transparent"}
            strokeWidth={strokeWidth}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});

export default StarRating;