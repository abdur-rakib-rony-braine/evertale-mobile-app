import { ScrollView, Pressable, Text, StyleSheet } from "react-native";

interface DressCategoriesProps {
  options: { title: string; value: string }[];
  activeCategory: string | null;
  onChange: (value: string) => void;
}

export default function DressCategories({
  options,
  activeCategory,
  onChange,
}: DressCategoriesProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {options.map((opt) => {
        const isActive = activeCategory === opt.value;
        return (
          <Pressable
            key={opt.value}
            style={[styles.btn, isActive && styles.btnActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {opt.title} Dress
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { gap: 8, paddingHorizontal: 16 },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
  },
  btnActive: { backgroundColor: "#AE7857", borderColor: "#AE7857" },
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: "#78716C",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  textActive: { color: "#FFFFFF" },
});