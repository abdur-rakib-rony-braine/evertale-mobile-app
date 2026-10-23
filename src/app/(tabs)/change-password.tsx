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
import { ArrowLeft, CheckCircle, Eye, EyeOff, ShieldCheck } from "lucide-react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { apiClient } from "@/lib/api/client";

const PasswordValidation = ({ password }: { password: string }) => {
  const validations = {
    uppercase: /[A-Z]/.test(password),
    minLength: password.length >= 6,
    number: /[0-9]/.test(password),
  };

  const rules = [
    { key: "uppercase", label: "One uppercase letter" },
    { key: "minLength", label: "Minimum 6 characters" },
    { key: "number", label: "At least one number" },
  ] as const;

  return (
    <View style={styles.validationContainer}>
      <Text style={styles.validationTitle}>Password must:</Text>
      {rules.map((rule) => (
        <View key={rule.key} style={styles.validationRow}>
          <CheckCircle
            size={14}
            color={validations[rule.key] ? "#16A34A" : "#D6D3D1"}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.validationText,
              { color: validations[rule.key] ? "#44403C" : "#A8A29E" },
            ]}
          >
            {rule.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const goBackToAccount = () => {
    router.replace("/account");
  };

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword) {
      Toast.show({ type: "error", text1: "Please fill in all fields." });
      return;
    }

    const isValid =
      /[A-Z]/.test(newPassword) &&
      newPassword.length >= 6 &&
      /[0-9]/.test(newPassword);

    if (!isValid) {
      Toast.show({
        type: "error",
        text1: "New password does not meet requirements.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.patch("/api/auth/mobile-change-password", {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Password changed successfully",
        });
        
        setCurrentPassword("");
        setNewPassword("");
        
        goBackToAccount();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Failed to change password",
      });
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
          <Pressable style={styles.backBtn} onPress={goBackToAccount}>
            <ArrowLeft size={18} color="#78716C" />
            <Text style={styles.backText}>Back to Settings</Text>
          </Pressable>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={28} color="#AE7857" />
            </View>
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.subtitle}>
              Your new password must meet the requirements below.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                placeholder="Enter current password"
                placeholderTextColor="#A8A29E"
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? (
                  <EyeOff size={18} color="#78716C" />
                ) : (
                  <Eye size={18} color="#78716C" />
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                placeholder="Create a password"
                placeholderTextColor="#A8A29E"
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowNew(!showNew)}
              >
                {showNew ? (
                  <EyeOff size={18} color="#78716C" />
                ) : (
                  <Eye size={18} color="#78716C" />
                )}
              </Pressable>
            </View>
            <PasswordValidation password={newPassword} />
          </View>

          <Pressable
            style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>SAVE CHANGES</Text>
            )}
          </Pressable>
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
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  backText: {
    fontSize: 14,
    color: "#78716C",
    fontWeight: "500",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    textAlign: "center",
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#44403C",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    height: 48,
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#292524",
  },
  eyeIcon: {
    padding: 12,
  },
  validationContainer: {
    marginTop: 12,
    gap: 6,
  },
  validationTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#78716C",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  validationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  validationText: {
    fontSize: 12,
  },
  submitBtn: {
    height: 48,
    backgroundColor: "#AE7857",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
});