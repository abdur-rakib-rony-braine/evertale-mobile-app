import { StyleSheet, Text } from "react-native";

const ReviewMessage = () => {
  return <Text style={styles.text}>Was this helpful?</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    color: "#4B5563",
  },
});

export default ReviewMessage;