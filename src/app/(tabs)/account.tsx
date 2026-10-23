import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HeaderBar from "@/components/comps/header-bar";
import Topbar from "@/components/comps/topbar";

export default function AccountScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <Topbar />
      <HeaderBar />
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-semibold text-stone-700">Account</Text>
      </View>
    </SafeAreaView>
  );
}