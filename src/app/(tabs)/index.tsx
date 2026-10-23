import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Topbar from "@/components/comps/topbar";
import HeroContainer from "@/components/comps/hero-container";
import HeaderBar from "@/components/comps/header-bar";
import PromotionalBanner from "@/components/comps/promotional-banner";
import CategorySection from "@/components/comps/category-section";
import NewArrivals from "@/components/comps/new-arrivals";

export default function HomeScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Topbar />
      <HeaderBar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroContainer />
        <PromotionalBanner />
        <CategorySection />
        <NewArrivals />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});