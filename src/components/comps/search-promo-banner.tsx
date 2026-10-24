import { StyleSheet, Text, View } from "react-native";

interface SearchPromoBannerProps {
  title: string;
  query: string;
}

export default function SearchPromoBanner({ title, query }: SearchPromoBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.breadcrumbRow}>
        <Text style={styles.breadcrumbText}>search</Text>
        <Text style={styles.breadcrumbSeparator}>/</Text>
        <Text style={styles.breadcrumbText}>{query}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F0ECE6",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  breadcrumbText: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#78716C",
  },
  breadcrumbSeparator: {
    fontSize: 10,
    color: "#A8A29E",
  },
  title: {
    fontSize: 16,
    fontFamily: "Rexagus",
    textAlign: "center",
    color: "#2C1A10",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
});