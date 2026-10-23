import { StyleSheet, Text, View } from "react-native";
import { User, Mail, Phone } from "lucide-react-native";

interface CustomerInfoProps {
  customer: any;
}

const InfoRow = ({ icon: Icon, label, value }: any) => (
  <View style={styles.row}>
    <Icon size={14} color="#A8A29E" strokeWidth={1.8} style={styles.icon} />
    <View style={styles.textContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "Not set"}</Text>
    </View>
  </View>
);

export default function CustomerInfo({ customer }: CustomerInfoProps) {
  if (!customer) return null;

  return (
    <View style={styles.container}>
      <InfoRow icon={User} label="Name" value={customer.name} />
      <InfoRow icon={Mail} label="Email" value={customer.email} />
      {customer.phone && (
        <InfoRow icon={Phone} label="Phone" value={customer.phone} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  icon: {
    marginTop: 2,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#A8A29E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 14,
    color: "#292524",
  },
});