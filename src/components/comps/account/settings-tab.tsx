import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronDown, ChevronRight, X } from "lucide-react-native";
import Toast from "react-native-toast-message";

import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api/client";
import AddressFinder from "@/components/comps/address-finder";
import DatePicker from "@/components/comps/date-picker";

const AUSTRALIAN_STATES = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"];

export default function SettingsTab() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [dob, setDob] = useState<Date | null>(user?.dob ? new Date(user.dob) : null);

  const [address, setAddress] = useState(user?.address || "");
  const [suburb, setSuburb] = useState(user?.suburb || "");
  const [state, setState] = useState(user?.state || "");
  const [postcode, setPostcode] = useState(user?.postcode || "");

  const [isUpdating, setIsUpdating] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const payload = {
        firstName,
        lastName,
        phone,
        dob: dob ? dob.toISOString() : null,
        address,
        suburb,
        state,
        postcode,
      };

      const res = await apiClient.patch("/api/auth/mobile-update-profile", {
        userInfo: payload,
      });

      if (res.data.success) {
        updateUser(payload);
        Toast.show({
          type: "success",
          text1: "Profile updated successfully",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  console.log('data', JSON.stringify(user))
  const formContent = (
    <>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email Address</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => router.push("/change-password" as never)}
      >
        <Text style={styles.linkText}>Change Password</Text>
        <ChevronRight size={18} color="#A8A29E" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+61 4xx xxx xxx"
            keyboardType="phone-pad"
          />
        </View>

        <DatePicker value={dob} onChange={setDob} />
      </View>

      <View style={[styles.card, { zIndex: 10 }]}>
        <Text style={styles.sectionTitle}>ADDRESS DETAILS</Text>

        <View style={{ zIndex: 100 }}>
          <AddressFinder
            defaultValue={address}
            onAddressSelect={(data) => {
              setAddress(data.address);
              setSuburb(data.suburb);
              setState(data.state);
              setPostcode(data.postcode);
            }}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Suburb</Text>
          <TextInput
            style={styles.input}
            value={suburb}
            onChangeText={setSuburb}
            placeholder="Suburb"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>State</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setShowStateModal(true)}
            >
              <Text style={[styles.selectText, !state && { color: "#A8A29E" }]}>
                {state || "Select State"}
              </Text>
              <ChevronDown size={18} color="#78716C" />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Postcode</Text>
            <TextInput
              style={styles.input}
              value={postcode}
              onChangeText={setPostcode}
              placeholder="e.g. 2000"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, isUpdating && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
        )}
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={[1]}
        keyExtractor={() => "form"}
        renderItem={() => <>{formContent}</>}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showStateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStateModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowStateModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <X size={20} color="#78716C" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {AUSTRALIAN_STATES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.modalItem,
                    state === s && { backgroundColor: "#FDF8F5" }
                  ]}
                  onPress={() => {
                    setState(s);
                    setShowStateModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    state === s && { color: "#AE7857", fontWeight: "600" }
                  ]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF9", padding: 16 },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#A8A29E",
    letterSpacing: 1,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: { fontSize: 14, color: "#78716C" },
  infoValue: { fontSize: 14, fontWeight: "500", color: "#292524" },
  linkRow: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  linkText: { fontSize: 14, fontWeight: "500", color: "#292524" },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#78716C",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#292524",
  },
  selectBtn: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  selectText: {
    fontSize: 14,
    color: "#292524",
  },
  row: { flexDirection: "row", gap: 12 },
  saveBtn: {
    height: 48,
    backgroundColor: "#AE7857",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#292524",
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  modalItemText: {
    fontSize: 15,
    color: "#44403C",
  },
});