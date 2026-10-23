import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HeaderBar from "@/components/comps/header-bar";
import Topbar from "@/components/comps/topbar";

export default function WishlistScreen() {
  return (
    <SafeAreaView edges={["top"]}>
      <Topbar />
      <HeaderBar />
      <View>
        <Text>Wishlist</Text>
      </View>
    </SafeAreaView>
  );
}