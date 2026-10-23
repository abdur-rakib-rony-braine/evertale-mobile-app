import { SCREEN_WIDTH } from "@/lib/device";
import { Check, X } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const toastConfig = {
  success: ({ text1, onPress }: any) => (
    <View style={styles.pillSuccess}>
      <View style={styles.leftBlock}>
        <Check size={22} color="#FFFFFF" />
        <Text style={styles.message} numberOfLines={2}>
          {text1}
        </Text>
      </View>

      <TouchableOpacity onPress={onPress} hitSlop={8} activeOpacity={0.7}>
        <X size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  ),

  error: ({ text1, onPress }: any) => (
    <View style={styles.pillError}>
      <View style={styles.leftBlock}>
        <X size={22} color="#FFFFFF" />
        <Text style={styles.message} numberOfLines={2}>
          {text1}
        </Text>
      </View>

      <TouchableOpacity onPress={onPress} hitSlop={8} activeOpacity={0.7}>
        <Check size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  ),
};

const styles = StyleSheet.create({
  pillSuccess: {
    height: 44,
    width: "100%",
    backgroundColor: "#1C9A6C",
    maxWidth: SCREEN_WIDTH - 32,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 9999999,
  },
  pillError: {
    height: 44,
    width: "100%",
    backgroundColor: "#D84727",
    maxWidth: SCREEN_WIDTH - 32,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 9999999,
  },
  leftBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  message: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default toastConfig;