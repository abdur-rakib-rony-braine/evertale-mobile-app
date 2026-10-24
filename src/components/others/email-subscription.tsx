import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ArrowRight } from "lucide-react-native";
import Toast from "react-native-toast-message";

import { apiClient } from "@/lib/api/client";

export default function EmailSubscription() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    
    if (!email) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post("/api/email-subscriber", { email });
      
      if (res.data?.success) {
        Toast.show({
          type: "success",
          text1: res.data.message || "Successfully subscribed!",
        });
        setEmail("");
      } else {
        Toast.show({
          type: "error",
          text1: res.data.message || "Subscription failed.",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1:
          err.response?.data?.message ||
          "There was a problem subscribing. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Newsletter</Text>
      <Text style={styles.title}>Stay in the Loop</Text>
      <Text style={styles.description}>
        Be the first to discover new arrivals, exclusive offers, and stories
        from Evertale.
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Your email address"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#6B4B3E" />
            ) : (
              <>
                <Text style={styles.buttonText}>Notify Me</Text>
                <ArrowRight size={14} color="#6B4B3E" />
              </>
            )}
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.footerText}>
          No spam. Unsubscribe any time.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#AE7857",
    paddingVertical: 64,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.5)",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: "Rexagus",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 320,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    padding: 6,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    color: "#FFFFFF",
    fontSize: 14,
  },
  button: {
    height: 44,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B4B3E",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  errorText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  footerText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginTop: 16,
    letterSpacing: 0.5,
  },
});