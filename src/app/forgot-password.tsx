import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyRound, MailCheck } from "lucide-react-native";
import { useRouter } from "expo-router";

import { urls } from "@/constants/url";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      const response = await fetch(`${urls.api.base}/api/auth/mobile-forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || "Failed to send reset link.");
        return;
      }

      setIsSuccess(true);
    } catch (error) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back to Login</Text>
          </Pressable>

          {!isSuccess ? (
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <KeyRound size={28} color="#AE7857" />
              </View>
              
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>

              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="example@email.com"
                  placeholderTextColor="#A8A29E"
                />
              </View>

              <Pressable
                style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>SEND RESET LINK</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={[styles.card, styles.successCard]}>
              <View style={styles.iconCircle}>
                <MailCheck size={28} color="#059669" />
              </View>
              
              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent a password reset link to:
              </Text>
              
              <View style={styles.emailBox}>
                <Text style={styles.emailText}>{email}</Text>
              </View>

              <Text style={styles.helpText}>
                Didn't receive it? Check your spam folder or try again.
              </Text>

              <Pressable
                style={styles.tryAgainBtn}
                onPress={() => setIsSuccess(false)}
              >
                <Text style={styles.tryAgainText}>Try a different email</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF9",
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    paddingTop: 40,
  },
  backBtn: {
    marginBottom: 24,
  },
  backText: {
    fontSize: 14,
    color: "#78716C",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderWidth: 1,
    borderColor: "#F5F5F4",
  },
  successCard: {
    alignItems: "center",
    textAlign: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FDF8F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "500",
    color: "#292524",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#78716C",
    marginBottom: 24,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#44403C",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#292524",
  },
  submitBtn: {
    height: 48,
    backgroundColor: "#AE7857",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  emailBox: {
    backgroundColor: "#F5F5F4",
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  emailText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
  },
  helpText: {
    fontSize: 12,
    color: "#A8A29E",
    textAlign: "center",
    marginBottom: 24,
  },
  tryAgainBtn: {
    paddingVertical: 12,
  },
  tryAgainText: {
    fontSize: 13,
    color: "#AE7857",
    fontWeight: "500",
  },
});