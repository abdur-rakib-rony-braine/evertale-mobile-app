import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertCircle, CheckCircle } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { urls } from "@/constants/url";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");

  useEffect(() => {
    if (!token) {
      setStatus("failed");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`${urls.api.base}/api/auth/mobile-verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setStatus("success");
          setTimeout(() => {
            router.replace("/account");
          }, 3000);
        } else {
          setStatus("failed");
        }
      } catch (error) {
        setStatus("failed");
      }
    };

    verify();
  }, [token, router]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {status === "verifying" && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#AE7857" />
            <Text style={styles.title}>Verifying Your Email</Text>
            <Text style={styles.subtitle}>
              Please wait while we verify your email address...
            </Text>
          </View>
        )}

        {status === "success" && (
          <View style={styles.centerBox}>
            <CheckCircle size={64} color="#22C55E" />
            <Text style={styles.title}>Email Verified Successfully!</Text>
            <Text style={styles.subtitle}>
              Your email has been verified. You will be redirected to the login page shortly.
            </Text>
          </View>
        )}

        {status === "failed" && (
          <View style={styles.centerBox}>
            <AlertCircle size={64} color="#EF4444" />
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.subtitle}>
              The verification link is invalid or has expired. Please request a new one.
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => router.replace("/account")}
            >
              <Text style={styles.buttonText}>BACK TO LOGIN</Text>
            </Pressable>
          </View>
        )}

      </ScrollView>
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
    justifyContent: "center",
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#292524",
    textAlign: "center",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#78716C",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#AE7857",
    paddingHorizontal: 32,
    paddingVertical: 14,
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    textAlign: "center",
  },
});