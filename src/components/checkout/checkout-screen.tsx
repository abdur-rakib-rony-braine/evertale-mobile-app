import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import Toast from "react-native-toast-message";

import CheckoutStepper from "./checkout-stepper";
import ShippingForm from "./shipping-form";
import BillingForm from "./billing-form";
import Shipping from "./shipping";
import OrderSummary from "./order-summary";
import PaymentForm from "./payment-form";
import { useCheckoutStore } from "@/store/checkout-store";
import { useCheckoutStepStore } from "@/store/checkout-step-store";
import { useAuthStore, AuthUser } from "@/store/auth-store";

const CheckoutScreen = () => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  
  const [hasInitialized, setHasInitialized] = useState(false);

  const { currentStep, goToNextStep, goToPreviousStep, markStepComplete, resetSteps } =
    useCheckoutStepStore();

  const {
    shippingAddress,
    billingAddress,
    shipping,
    fieldErrors,
    sameAsShipping,
    initializeWithUserData,
    resetCheckout,
  } = useCheckoutStore();

  const dataSource: AuthUser | {} = user || {};

  useEffect(() => {
    if (dataSource && Object.keys(dataSource).length > 0 && !hasInitialized) {
      initializeWithUserData(dataSource);
      setHasInitialized(true);
    }
  }, [dataSource, initializeWithUserData, hasInitialized]);

  const formData = useMemo(() => {
    const userData = dataSource as AuthUser;

    const shippingData = shippingAddress?.firstName
      ? shippingAddress
      : userData
      ? {
          firstName: userData?.firstName || "",
          lastName: userData?.lastName || "",
          email: userData?.email || "",
          phone: userData?.phone || "",
          address: userData?.address || "",
          address2: userData?.address2 || "",
          suburb: userData?.suburb || "",
          state: userData?.state || "",
          postcode: userData?.postcode || "",
        }
      : {};

    const billingData = billingAddress?.firstName ? billingAddress : shippingData;

    return {
      shipping: shippingData,
      billing: billingData,
      sameAsShipping,
    };
  }, [shippingAddress, billingAddress, dataSource, sameAsShipping]);

  const canProceedFromStep = (step: number) => {
    if (step === 1) {
      return !!(
        shippingAddress?.firstName &&
        shippingAddress?.lastName &&
        shippingAddress?.email &&
        shippingAddress?.phone &&
        shippingAddress?.address &&
        shippingAddress?.suburb &&
        shippingAddress?.state &&
        shippingAddress?.postcode &&
        Object.keys(fieldErrors).length === 0
      );
    }
    if (step === 2) {
      if (sameAsShipping) return true;
      return !!(
        billingAddress?.firstName &&
        billingAddress?.lastName &&
        billingAddress?.email &&
        billingAddress?.phone &&
        billingAddress?.address &&
        billingAddress?.suburb &&
        billingAddress?.state &&
        billingAddress?.postcode &&
        Object.keys(fieldErrors).length === 0
      );
    }
    if (step === 3) return !!(shipping?.method && shipping?.cost !== undefined);
    return true;
  };

  const handleNext = () => {
    if (!canProceedFromStep(currentStep)) {
      Toast.show({
        type: "error",
        text1: "Please complete all required fields",
      });
      return;
    }

    markStepComplete(currentStep);
    goToNextStep();
  };

  const handlePrevious = () => {
    goToPreviousStep();
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Checkout",
      "Are you sure you want to cancel your checkout?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: () => {
            resetCheckout();
            resetSteps();
            router.replace("/cart" as never);
          },
        },
      ]
    );
  };

  const steps = [
    { title: "Shipping Address" },
    { title: "Billing Address" },
    { title: "Delivery" },
    { title: "Payment" },
  ];

  const getNextButtonText = () => {
    if (currentStep === 4) return "Complete Order";
    const next = steps[currentStep];
    return `Continue to ${next?.title || "Next"}`;
  };

  const getBackButtonText = () => {
    const map: Record<number, string> = {
      2: "Back to Shipping",
      3: "Back to Billing",
      4: "Back to Delivery",
    };
    return map[currentStep] || "Back";
  };

  const stepContent = {
    1: <ShippingForm initialData={formData} userData={dataSource} />,
    2: <BillingForm initialData={formData} />,
    3: <Shipping />,
    4: <PaymentForm />,
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Express</Text>
          <Text style={styles.title}>Checkout</Text>
          <Text style={styles.subtitle}>Pay instantly</Text>
        </View>

        {/* Order Summary (top on mobile) */}
        <View style={styles.summaryWrapper}>
          <OrderSummary />
        </View>

        {/* Checkout Steps */}
        <View style={styles.content}>
          <View style={styles.stepperWrapper}>
            <CheckoutStepper />
          </View>

          <View style={styles.stepContent}>
            {stepContent[currentStep as keyof typeof stepContent]}
          </View>

          {/* Footer Nav */}
          <View style={styles.footer}>
            <Pressable
              onPress={currentStep === 1 ? handleCancel : handlePrevious}
              style={styles.backBtn}
            >
              {currentStep !== 1 && (
                <ArrowLeft size={14} color="#1C1917" strokeWidth={2} />
              )}
              <Text style={styles.backBtnText} numberOfLines={1}>
                {currentStep === 1 ? "Cancel" : getBackButtonText()}
              </Text>
            </Pressable>

            {currentStep < 4 && (
              <Pressable
                onPress={handleNext}
                disabled={!canProceedFromStep(currentStep)}
                style={[
                  styles.nextBtn,
                  !canProceedFromStep(currentStep) && styles.nextBtnDisabled,
                ]}
              >
                <Text style={styles.nextBtnText} numberOfLines={1}>
                  {getNextButtonText()}
                </Text>
                <ArrowRight size={14} color="#FFFFFF" strokeWidth={2} />
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingBottom: 40 },

  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2.64,
    textTransform: "uppercase",
    color: "#A8A29E",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: "#1C1917",
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 12,
    color: "#A8A29E",
    marginTop: 4,
  },

  summaryWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  content: {
    backgroundColor: "#FAF6F1",
  },
  stepperWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  stepContent: {
    paddingBottom: 8,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#1C1917",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    justifyContent: "center",
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#1C1917",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1C1917",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1.5,
    justifyContent: "center",
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#FFFFFF",
  },
});

export default CheckoutScreen;