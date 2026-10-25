import { SafeAreaView } from "react-native-safe-area-context";

import HeaderBar from "@/components/comps/header-bar";
import Topbar from "@/components/comps/topbar";
import Cart from "@/components/others/cart";

export default function CartScreen() {
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
    >
      <Topbar />
      <HeaderBar />
      <Cart />
    </SafeAreaView>
  );
}