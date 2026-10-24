import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Topbar from "@/components/comps/topbar";
import HeroContainer from "@/components/comps/hero-container";
import HeaderBar from "@/components/comps/header-bar";
import PromotionalBanner from "@/components/comps/promotional-banner";
import CategorySection from "@/components/comps/category-section";
import NewArrivals from "@/components/comps/new-arrivals";
import CollectionsSection from "@/components/others/collections-section";
import PassionateSection from "@/components/others/passionate-section";
import WomenProductSection from "@/components/others/women-product-section";
import KidProductSection from "@/components/others/kid-product-section";
import ReviewsSection from "@/components/others/reviews";
import EmailSubscription from "@/components/others/email-subscription";
import InstagramFollowSection from "@/components/others/instagram-follow";

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
        <WomenProductSection />
        <KidProductSection />
        <CollectionsSection />
        <PassionateSection />
        <ReviewsSection />
        <EmailSubscription />
        <InstagramFollowSection />
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