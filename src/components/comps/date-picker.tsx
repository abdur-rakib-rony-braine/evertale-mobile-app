import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";

interface DatePickerProps {
  value?: string | Date | null;
  onChange: (date: Date | null) => void;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const [show, setShow] = useState(false);

  const currentDate = value ? new Date(value) : new Date();
  const displayDate = value
    ? new Date(value).toLocaleDateString("en-AU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Select Date of Birth";

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }
    
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date Of Birth</Text>
      
      <Pressable style={styles.input} onPress={() => setShow(!show)}>
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {displayDate}
        </Text>
        <Calendar size={18} color="#78716C" />
      </Pressable>

      {show && (
        <View style={Platform.OS === "ios" ? styles.iosPickerContainer : {}}>
          <DateTimePicker
            value={currentDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={new Date()}
            onValueChange={handleChange} // <--- Fixed here
          />
          {Platform.OS === "ios" && (
            <Pressable style={styles.iosDoneBtn} onPress={() => setShow(false)}>
              <Text style={styles.iosDoneText}>Done</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#44403C",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  inputText: { fontSize: 14, color: "#292524" },
  placeholder: { color: "#A8A29E" },
  iosPickerContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    marginTop: 4,
    paddingBottom: 8,
  },
  iosDoneBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iosDoneText: {
    color: "#AE7857",
    fontWeight: "600",
    fontSize: 14,
  },
});