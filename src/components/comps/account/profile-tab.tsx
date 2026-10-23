import * as ImagePicker from "expo-image-picker";
import {
    Calendar,
    Camera,
    CheckCircle,
    Clock,
    CreditCard,
    Globe,
    Hash,
    Mail,
    MapPin,
    Pen,
    Phone,
    Shield,
    User,
    XCircle
} from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not set";

const formatDateTime = (d?: string) =>
  d
    ? new Date(d).toLocaleString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not set";

const InfoRow = ({ icon: Icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <Icon size={14} color="#A8A29E" strokeWidth={1.8} style={styles.icon} />
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Not set"}</Text>
    </View>
  </View>
);

const StatusBadge = ({ active, label, description }: any) => (
  <View style={styles.statusBadge}>
    <View style={styles.statusHeader}>
      {active ? (
        <CheckCircle size={14} color="#22C55E" strokeWidth={2} />
      ) : (
        <XCircle size={14} color="#D6D3D1" strokeWidth={2} />
      )}
      <Text style={styles.statusLabel}>{label}</Text>
    </View>
    <Text style={styles.statusDesc}>{description}</Text>
  </View>
);

export default function ProfileTab() {
  const { user, updateUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        const file = result.assets[0];
        
        formData.append("profilePicture", {
          uri: file.uri,
          type: file.mimeType || "image/jpeg",
          name: file.fileName || "profile.jpg",
        } as any);
        formData.append("userId", user?._id || "");

        // Using fetch instead of apiClient for FormData so axios sets the right boundary
        const token = useAuthStore.getState().token;
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/upload-profile-picture`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          updateUser({ profilePicture: data.imageUrl });
          Alert.alert("Success", "Profile picture updated!");
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to upload image.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = async () => {
    Alert.alert("Delete Picture", "Are you sure you want to remove your profile picture?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setIsUploading(true);
          try {
            await apiClient.delete(`/api/upload-profile-picture?userId=${user?._id}`);
            updateUser({ profilePicture: undefined });
          } catch {
            Alert.alert("Error", "Failed to delete picture.");
          } finally {
            setIsUploading(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      <View style={styles.avatarSection}>
        <Pressable style={styles.avatarContainer} onPress={pickImage}>
          {user?.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Text>
            </View>
          )}
          <View style={styles.cameraOverlay}>
            {isUploading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Camera size={20} color="#FFF" />
            )}
          </View>
        </Pressable>

        <Text style={styles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <User size={16} color="#A8A29E" />
          <Text style={styles.cardTitle}>PERSONAL DETAILS</Text>
        </View>
        <View style={styles.grid}>
          <InfoRow icon={Hash} label="User ID" value={user?._id?.slice(-6).toUpperCase()} />
          <InfoRow icon={User} label="First Name" value={user?.firstName} />
          <InfoRow icon={User} label="Last Name" value={user?.lastName} />
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow icon={Phone} label="Phone" value={user?.phone} />
          <InfoRow icon={Calendar} label="Date of Birth" value={formatDate()} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MapPin size={16} color="#A8A29E" />
          <Text style={styles.cardTitle}>ADDRESS DETAILS</Text>
        </View>
        <View style={styles.grid}>
          <InfoRow icon={MapPin} label="Primary Address" value={"Not set"} />
          <InfoRow icon={MapPin} label="Secondary Address" value={"Not set"} />
          <InfoRow icon={Globe} label="Suburb" value={"Not set"} />
          <InfoRow icon={Hash} label="Postcode" value={"Not set"} />
          <InfoRow icon={MapPin} label="State" value={"Not set"} />
          <InfoRow icon={Globe} label="Country" value={"Australia"} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Shield size={16} color="#A8A29E" />
          <Text style={styles.cardTitle}>ACCOUNT STATUS</Text>
        </View>
        <View style={styles.statusGrid}>
          <StatusBadge active={true} label="Account Active" description="Active" />
          <StatusBadge active={true} label="Email Verified" description="Verified" />
          <StatusBadge active={false} label="Newsletter" description="Not subscribed" />
          <StatusBadge active={false} label="2FA" description="Disabled" />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <CreditCard size={16} color="#A8A29E" />
          <Text style={styles.cardTitle}>ACCOUNT STATISTICS</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { fontSize: 14, color: "#22C55E" }]}>
              Verified
            </Text>
            <Text style={styles.statLabel}>Account Status</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Clock size={16} color="#A8A29E" />
          <Text style={styles.cardTitle}>ACCOUNT TIMELINE</Text>
        </View>
        <View style={styles.grid}>
          <InfoRow icon={Calendar} label="Account Created" value={formatDateTime()} />
          <InfoRow icon={Pen} label="Last Updated" value={formatDateTime()} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF9" },
  avatarSection: { alignItems: "center", paddingVertical: 24 },
  avatarContainer: { width: 96, height: 96, borderRadius: 48, marginBottom: 12, position: "relative" },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#AE7857", alignItems: "center", justifyContent: "center" },
  avatarInitials: { color: "#FFF", fontSize: 24, fontWeight: "600" },
  cameraOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.4)", height: 32, alignItems: "center", justifyContent: "center", borderBottomLeftRadius: 48, borderBottomRightRadius: 48 },
  userName: { fontSize: 18, fontWeight: "600", color: "#292524", textTransform: "capitalize" },
  userEmail: { fontSize: 13, color: "#78716C", marginTop: 2 },

  card: { backgroundColor: "#FFF", marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: "#F5F5F4", padding: 16 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  cardTitle: { fontSize: 11, fontWeight: "600", color: "#A8A29E", letterSpacing: 1 },
  
  grid: { gap: 16 },
  infoRow: { flexDirection: "row", alignItems: "flex-start" },
  icon: { marginTop: 2, marginRight: 12 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: "600", color: "#A8A29E", textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue: { fontSize: 14, color: "#292524", marginTop: 2 },

  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statusBadge: { flex: 1, minWidth: "45%", borderWidth: 1, borderColor: "#F5F5F4", padding: 12 },
  statusHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  statusLabel: { fontSize: 12, fontWeight: "600", color: "#44403C" },
  statusDesc: { fontSize: 11, color: "#A8A29E" },

  statsGrid: { flexDirection: "row", gap: 12 },
  statBox: { flex: 1, borderWidth: 1, borderColor: "#F5F5F4", padding: 16, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "600", color: "#AE7857" },
  statLabel: { fontSize: 11, color: "#A8A29E", marginTop: 4 },
});