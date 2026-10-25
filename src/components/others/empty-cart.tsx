import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Handbag } from "lucide-react-native";

const EmptyCart = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Handbag size={36} color="#d6d3d1" strokeWidth={1.5} />
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.title}>Your Cart is Empty</Text>
        <Text style={styles.subtitle}>
          Explore our curated collections and find something you'll love.
        </Text>
      </View>

      <Pressable
        onPress={() => router.push("/" as never)}
        style={styles.outlineButton}
      >
        <Handbag size={14} color="#1c1917" strokeWidth={2} />
        <Text style={styles.outlineButtonText}>Start Shopping</Text>
      </Pressable>

      <Text style={styles.helpText}>
        Need help?{" "}
        <Text
          style={styles.helpLink}
          onPress={() => router.push("/contact" as never)}
        >
          Contact us
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  iconWrapper: {
    height: 80,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#F5F5F4",
  },
  textWrapper: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#292524",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#A8A29E",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#1C1917",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  outlineButtonText: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "600",
    color: "#1C1917",
  },
  helpText: {
    fontSize: 12,
    color: "#A8A29E",
  },
  helpLink: {
    color: "#AE7857",
  },
});

export default EmptyCart;