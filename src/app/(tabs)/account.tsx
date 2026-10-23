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
import { Eye, EyeOff, LogOut, User, Settings, Package } from "lucide-react-native";
import { useRouter } from "expo-router";

import HeaderBar from "@/components/comps/header-bar";
import Topbar from "@/components/comps/topbar";
import { useAuthStore } from "@/store/auth-store";
import ProfileTab from "@/components/comps/account/profile-tab";
import SettingsTab from "@/components/comps/account/settings-tab";
import OrdersTab from "@/components/comps/account/orders-tab";

export default function AccountScreen() {
  const router = useRouter();
  const { token, login, isLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "orders">("profile");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Please fill in all fields");
      return;
    }
    setErrorMsg("");
    const result = await login(email, password);
    if (!result.success) {
      setErrorMsg(result.message || "Login failed");
    }
  };

  const renderLogin = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.loginContainer}>
        <Text style={styles.loginSubtitle}>WELCOME BACK</Text>
        <Text style={styles.loginTitle}>Sign In</Text>
        <Text style={styles.loginDesc}>
          Enter your email and password to access your account.
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="Enter password"
              placeholderTextColor="#A8A29E"
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={18} color="#78716C" />
              ) : (
                <Eye size={18} color="#78716C" />
              )}
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>SIGN IN</Text>
          )}
        </Pressable>

        <View style={styles.footerLinks}>
          <Text style={styles.footerText}>Forgot password? </Text>
          <Text style={styles.footerLink} onPress={() => router.push("/forgot-password")}>
            Reset here
          </Text>
        </View>

        <View style={styles.footerLinks}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Text style={styles.footerLink} onPress={() => router.push("/register")}>
            Create Account
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Topbar />
      <HeaderBar />
      
      {!token ? (
        renderLogin()
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.tabBar}>
            <Pressable
              style={[styles.tabBtn, activeTab === "profile" && styles.tabBtnActive]}
              onPress={() => setActiveTab("profile")}
            >
              <User size={18} color={activeTab === "profile" ? "#AE7857" : "#78716C"} />
              <Text style={[styles.tabText, activeTab === "profile" && styles.tabTextActive]}>
                Profile
              </Text>
            </Pressable>
            
            <Pressable
              style={[styles.tabBtn, activeTab === "settings" && styles.tabBtnActive]}
              onPress={() => setActiveTab("settings")}
            >
              <Settings size={18} color={activeTab === "settings" ? "#AE7857" : "#78716C"} />
              <Text style={[styles.tabText, activeTab === "settings" && styles.tabTextActive]}>
                Settings
              </Text>
            </Pressable>
            
            <Pressable
              style={[styles.tabBtn, activeTab === "orders" && styles.tabBtnActive]}
              onPress={() => setActiveTab("orders")}
            >
              <Package size={18} color={activeTab === "orders" ? "#AE7857" : "#78716C"} />
              <Text style={[styles.tabText, activeTab === "orders" && styles.tabTextActive]}>
                Orders
              </Text>
            </Pressable>
          </View>

          <View style={{ flex: 1 }}>
            {activeTab === "profile" && <ProfileTab />}
            {activeTab === "settings" && <SettingsTab />}
            {activeTab === "orders" && <OrdersTab />}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  
  loginContainer: { padding: 24, flexGrow: 1, justifyContent: "center" },
  loginSubtitle: { fontSize: 10, letterSpacing: 1.5, color: "#A8A29E", marginBottom: 4, textAlign: "center" },
  loginTitle: { fontSize: 24, fontWeight: "500", color: "#292524", marginBottom: 8, textAlign: "center" },
  loginDesc: { fontSize: 12, color: "#A8A29E", marginBottom: 24, textAlign: "center" },
  errorBox: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", padding: 12, marginBottom: 16 },
  errorText: { color: "#DC2626", fontSize: 12 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: "600", color: "#44403C", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  input: { height: 48, borderWidth: 1, borderColor: "#E7E5E4", paddingHorizontal: 12, fontSize: 14, color: "#292524" },
  passwordContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E7E5E4", height: 48 },
  passwordInput: { flex: 1, height: "100%", paddingHorizontal: 12, fontSize: 14, color: "#292524" },
  eyeIcon: { padding: 12 },
  submitBtn: { height: 48, backgroundColor: "#AE7857", alignItems: "center", justifyContent: "center", marginTop: 8 },
  submitBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600", letterSpacing: 1.5 },
  footerLinks: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  footerText: { fontSize: 12, color: "#78716C" },
  footerLink: { fontSize: 12, color: "#AE7857", fontWeight: "500" },

  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E7E5E4", backgroundColor: "#FAFAF9" },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12, gap: 4 },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: "#AE7857", backgroundColor: "#FFFFFF" },
  tabText: { fontSize: 11, color: "#78716C", fontWeight: "500", textTransform: "uppercase" },
  tabTextActive: { color: "#AE7857", fontWeight: "600" },
});