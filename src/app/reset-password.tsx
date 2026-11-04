import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle, Eye, EyeOff, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HeaderBar from "@/components/comps/header-bar";
import Topbar from "@/components/comps/topbar";
import { urls } from "@/constants/url";

const RULES = [
  { key: "uppercase", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { key: "minLength", label: "Minimum 6 characters", test: (v: string) => v.length >= 6 },
  { key: "number", label: "At least one number", test: (v: string) => /[0-9]/.test(v) },
];

const PasswordValidation = ({ password }: { password: string }) => (
  <View style={styles.rules}>
    <Text style={styles.rulesTitle}>Password must:</Text>
    {RULES.map((rule) => {
      const ok = rule.test(password);
      return (
        <View key={rule.key} style={styles.ruleRow}>
          <CheckCircle
            size={14}
            color={ok ? "#16A34A" : "#D6D3D1"}
            strokeWidth={2}
          />
          <Text style={[styles.ruleText, ok && styles.ruleTextOk]}>
            {rule.label}
          </Text>
        </View>
      );
    })}
  </View>
);

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async () => {
    if (isLoading) return;

    setErrorMsg("");
    setPasswordError("");
    setConfirmError("");

    let valid = true;

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError("Must contain an uppercase letter");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Minimum 6 characters");
      valid = false;
    } else if (!/[0-9]/.test(password)) {
      setPasswordError("Must contain a number");
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError("Please confirm your password");
      valid = false;
    } else if (confirmPassword !== password) {
      setConfirmError("Passwords do not match");
      valid = false;
    }

    if (!valid) return;

    if (!token) {
      setErrorMsg("Invalid or missing reset token.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${urls.api.base}/api/auth/mobile-reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data?.message || "Password reset failed.");
        return;
      }

      setSuccessMsg("Password reset successful! Redirecting to login...");

      setTimeout(() => {
        router.push("/account");
      }, 2000);
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <Topbar />
        <HeaderBar />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <ShieldCheck size={22} color="#AE7857" strokeWidth={1.8} />
              </View>
              <Text style={styles.title}>Create New Password</Text>
            </View>

            <Text style={styles.subtitle}>
              Your new password must meet the requirements below.
            </Text>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{errorMsg}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.passwordContainer,
                  !!passwordError && styles.passwordContainerError,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  secureTextEntry={!showPassword}
                  placeholder="Create a password"
                  placeholderTextColor="#A8A29E"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <Pressable
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={6}
                >
                  {showPassword ? (
                    <EyeOff size={17} color="#78716C" strokeWidth={1.8} />
                  ) : (
                    <Eye size={17} color="#78716C" strokeWidth={1.8} />
                  )}
                </Pressable>
              </View>
              {passwordError ? (
                <Text style={styles.fieldError}>{passwordError}</Text>
              ) : null}
              <PasswordValidation password={password} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Confirm Password <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.passwordContainer,
                  !!confirmError && styles.passwordContainerError,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmError) setConfirmError("");
                  }}
                  secureTextEntry={!showConfirm}
                  placeholder="Confirm your password"
                  placeholderTextColor="#A8A29E"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  editable={!isLoading}
                />
                <Pressable
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirm(!showConfirm)}
                  hitSlop={6}
                >
                  {showConfirm ? (
                    <EyeOff size={17} color="#78716C" strokeWidth={1.8} />
                  ) : (
                    <Eye size={17} color="#78716C" strokeWidth={1.8} />
                  )}
                </Pressable>
              </View>
              {confirmError ? (
                <Text style={styles.fieldError}>{confirmError}</Text>
              ) : null}
            </View>

            <Pressable
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.submitInner}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Resetting Password...</Text>
                </View>
              ) : (
                <Text style={styles.submitBtnText}>Reset Password</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.footerCard}>
            <Text style={styles.footerText}>
              Remember your password?{" "}
              <Text
                style={styles.footerLink}
                onPress={() => router.push("/account")}
              >
                Sign In
              </Text>
            </Text>
            <Text style={styles.footerSmall}>
              For any inquiries, contact{" "}
              <Text
                style={styles.footerEmail}
                onPress={() => Linking.openURL("mailto:support@evertale.com.au")}
              >
                support@evertale.com.au
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingVertical: 32,
    gap: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: "#F2EFE9",
    borderRadius: 8,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2EFE9",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Rexagus",
    color: "#2B2520",
  },
  subtitle: {
    fontSize: 12,
    color: "#A8A29E",
    lineHeight: 18,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  errorBoxText: {
    color: "#DC2626",
    fontSize: 12,
  },
  successBox: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: "#059669",
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#44403C",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    borderRadius: 4,
    height: 46,
    backgroundColor: "#FFFFFF",
  },
  passwordContainerError: {
    borderColor: "#EF4444",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#2B2520",
  },
  eyeIcon: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
  },
  fieldError: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 6,
  },
  rules: {
    marginTop: 10,
    gap: 6,
  },
  rulesTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#44403C",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ruleText: {
    fontSize: 12,
    color: "#A8A29E",
  },
  ruleTextOk: {
    color: "#44403C",
  },
  submitBtn: {
    height: 46,
    backgroundColor: "#AE7857",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  footerCard: {
    borderWidth: 1,
    borderColor: "#F2EFE9",
    borderRadius: 8,
    padding: 18,
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#78716C",
    textAlign: "center",
  },
  footerLink: {
    color: "#AE7857",
    fontWeight: "600",
  },
  footerSmall: {
    fontSize: 12,
    color: "#A8A29E",
    textAlign: "center",
  },
  footerEmail: {
    color: "#57534E",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});