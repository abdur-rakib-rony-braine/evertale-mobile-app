import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ArrowRight } from "lucide-react-native";
import Toast from "react-native-toast-message";

import { apiClient } from "@/lib/api/client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const STACK = SCREEN_WIDTH < 360;

export default function EmailSubscription() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = async () => {
    if (isLoading) return;
    setError("");

    const value = email.trim();

    if (!value) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post("/api/email-subscriber", {
        email: value,
      });

      if (res.data?.success) {
        Toast.show({
          type: "success",
          text1: res.data.message || "Successfully subscribed!",
        });
        setEmail("");
      } else {
        Toast.show({
          type: "error",
          text1: res.data?.message || "Subscription failed.",
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
        <View
          style={[
            styles.inputWrapper,
            STACK && styles.inputWrapperStacked,
            focused && styles.inputWrapperFocused,
            !!error && styles.inputWrapperError,
          ]}
        >
          <TextInput
            style={[styles.input, STACK && styles.inputStacked]}
            placeholder="Your email address"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError("");
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={handleSubmit}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            editable={!isLoading}
          />
          <Pressable
            style={[
              styles.button,
              STACK && styles.buttonStacked,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#6B4B3E" />
            ) : (
              <>
                <Text style={styles.buttonText}>Notify Me</Text>
                <ArrowRight size={14} color="#6B4B3E" strokeWidth={2} />
              </>
            )}
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorPill}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.footerText}>No spam. Unsubscribe any time.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#AE7857",
    paddingVertical: 56,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 14,
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
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 320,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    padding: 6,
  },
  inputWrapperStacked: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 6,
  },
  inputWrapperFocused: {
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  inputWrapperError: {
    borderColor: "#FFD6D6",
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    color: "#FFFFFF",
    fontSize: 14,
  },
  inputStacked: {
    flex: 0,
  },
  button: {
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonStacked: {
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B4B3E",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  errorPill: {
    alignSelf: "center",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "rgba(120,20,20,0.35)",
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  footerText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginTop: 16,
    letterSpacing: 0.5,
  },
});