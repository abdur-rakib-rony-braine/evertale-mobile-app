import { images } from "@/constants/images";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { Menu, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useAuthStore } from "@/store/auth-store";
import { WithLocalSvg } from "react-native-svg/css";
import MobileDrawer from "./mobile-drawer";
import SearchComponent from "./search-component";

export default function HeaderBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [picFailed, setPicFailed] = useState(false);
  const router = useRouter();

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setPicFailed(false);
  }, [user?.profilePicture]);

  return (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.headerInner}>
          <View style={styles.leftGroup}>
            <Pressable
              onPress={() => setDrawerOpen(true)}
              hitSlop={10}
              style={styles.menuBtn}
            >
              <Menu size={22} color="#AE7857" strokeWidth={2} />
            </Pressable>

            <Pressable onPress={() => router.push("/")}>
              <WithLocalSvg
                asset={images.logo}
                width={100}
                height={32}
              />
            </Pressable>
          </View>

          <View style={styles.rightGroup}>
            <SearchComponent />

            <Pressable onPress={() => router.push("/account" as never)} hitSlop={8}>
              {user?.profilePicture && !picFailed ? (
                <ExpoImage
                  source={{ uri: user.profilePicture }}
                  style={styles.profilePic}
                  contentFit="cover"
                  transition={150}
                  onError={() => setPicFailed(true)}
                />
              ) : (
                <User size={20} color="#44403C" strokeWidth={1.8} />
              )}
            </Pressable>
          </View>
        </View>
      </View>

      <MobileDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuBtn: {
    padding: 4,
    marginLeft: -4,
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 14,
  },
});