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
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react-native";
import Toast from "react-native-toast-message";

import { apiClient } from "@/lib/api/client";

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
          <CheckCircle size={14} color={ok ? "#16A34A" : "#D6D3D1"} strokeWidth={2} />
          <Text style={[styles.ruleText, ok && styles.ruleTextOk]}>{rule.label}</Text>
        </View>
      );
    })}
  </View>
);

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [currentError, setCurrentError] = useState("");
  const [newError, setNewError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (isLoading) return;

    setCurrentError("");
    setNewError("");

    let valid = true;

    if (!currentPassword) {
      setCurrentError("Current Password is required");
      valid = false;
    }

    if (!newPassword) {
      setNewError("New Password is required");
      valid = false;
    } else if (!/[A-Z]/.test(newPassword)) {
      setNewError("Password must contain uppercase letter");
      valid = false;
    } else if (newPassword.length < 6) {
      setNewError("Minimum 6 characters required");
      valid = false;
    } else if (!/[0-9]/.test(newPassword)) {
      setNewError("At least one number required");
      valid = false;
    }

    if (!valid) return;

    setIsLoading(true);
    try {
      const res = await apiClient.patch("/api/auth/mobile-password-change", {
        currentPassword,
        newPassword,
      });

      Toast.show({ type: "success", text1: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message || "Something went wrong",
      });
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backRow}>
            <ArrowLeft size={14} color="#57534E" />
            <Text style={styles.backText}>Account settings</Text>
          </Pressable>

          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Change Password</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={[styles.inputWrap, !!currentError && styles.inputWrapError]}>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    if (currentError) setCurrentError("");
                  }}
                  secureTextEntry={!showCurrent}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="current-password"
                  editable={!isLoading}
                />
                <Pressable
                  onPress={() => setShowCurrent(!showCurrent)}
                  hitSlop={6}
                  style={styles.eye}
                >
                  {showCurrent ? (
                    <EyeOff size={16} color="#A8A29E" strokeWidth={1.8} />
                  ) : (
                    <Eye size={16} color="#A8A29E" strokeWidth={1.8} />
                  )}
                </Pressable>
              </View>
              {currentError ? <Text style={styles.fieldError}>{currentError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={[styles.inputWrap, !!newError && styles.inputWrapError]}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (newError) setNewError("");
                  }}
                  secureTextEntry={!showNew}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  editable={!isLoading}
                />
                <Pressable onPress={() => setShowNew(!showNew)} hitSlop={6} style={styles.eye}>
                  {showNew ? (
                    <EyeOff size={16} color="#A8A29E" strokeWidth={1.8} />
                  ) : (
                    <Eye size={16} color="#A8A29E" strokeWidth={1.8} />
                  )}
                </Pressable>
              </View>
              {newError ? <Text style={styles.fieldError}>{newError}</Text> : null}
              <PasswordValidation password={newPassword} />
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            >
              {isLoading ? (
                <View style={styles.submitInner}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitText}>Saving...</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>Save Changes</Text>
              )}
            </Pressable>
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
    padding: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 20,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 13,
    color: "#57534E",
  },
  card: {
    borderWidth: 1,
    borderColor: "#F2EFE9",
    borderRadius: 8,
    padding: 20,
    gap: 20,
    backgroundColor: "#FFFFFF",
  },
  header: {
    alignItems: "flex-start",
  },
  title: {
    fontSize: 22,
    fontFamily: "Rexagus",
    color: "#2B2520",
  },
  divider: {
    width: 36,
    height: 2,
    backgroundColor: "#AE7857",
    marginTop: 8,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#78716C",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  inputWrapError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#2B2520",
  },
  eye: {
    height: "100%",
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  fieldError: {
    fontSize: 12,
    color: "#EF4444",
  },
  rules: {
    marginTop: 8,
    gap: 6,
  },
  rulesTitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    color: "#78716C",
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
    borderRadius: 4,
    backgroundColor: "#AE7857",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
});