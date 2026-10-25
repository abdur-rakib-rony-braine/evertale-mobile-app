import { StyleSheet, Text, View } from "react-native";
import { Check, Truck, CreditCard, Package, Lock } from "lucide-react-native";

import { useCheckoutStepStore } from "@/store/checkout-step-store";

const STEPS = [
  { title: "Shipping", icon: Truck },
  { title: "Billing", icon: CreditCard },
  { title: "Delivery", icon: Package },
  { title: "Payment", icon: Lock },
];

const CheckoutStepper = () => {
  const currentStep = useCheckoutStepStore((s) => s.currentStep);
  const completedSteps = useCheckoutStepStore((s) => s.completedSteps);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = completedSteps.includes(stepNumber);
        const isCurrent = currentStep === stepNumber;
        const isActive = isCompleted || isCurrent;

        const IconComponent = step.icon;

        return (
          <View key={step.title} style={styles.stepWrapper}>
            <View style={styles.stepContent}>
              <View
                style={[
                  styles.indicator,
                  isCompleted && styles.indicatorCompleted,
                  isCurrent && styles.indicatorCurrent,
                  !isActive && styles.indicatorInactive,
                ]}
              >
                {isCompleted ? (
                  <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                ) : (
                  <IconComponent
                    size={14}
                    color={isCurrent ? "#FFFFFF" : "#A8A29E"}
                    strokeWidth={1.8}
                  />
                )}
              </View>

              <Text
                style={[styles.title, isActive && styles.titleActive]}
                numberOfLines={1}
              >
                {step.title}
              </Text>
            </View>

            {index < STEPS.length - 1 ? (
              <View style={styles.lineWrapper}>
                <View
                  style={[
                    styles.line,
                    isCompleted && styles.lineCompleted,
                  ]}
                />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
  },
  stepWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
  },
  stepContent: {
    alignItems: "center",
    flex: 1,
    gap: 8,
    zIndex: 2,
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  indicatorInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E5E4",
  },
  indicatorCurrent: {
    backgroundColor: "#1C1917",
    borderColor: "#1C1917",
  },
  indicatorCompleted: {
    backgroundColor: "#6B4B3E",
    borderColor: "#6B4B3E",
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "#A8A29E",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  titleActive: {
    color: "#292524",
  },
  lineWrapper: {
    position: "absolute",
    top: 16,
    left: "50%",
    right: "-50%",
    height: 1,
    zIndex: 1,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E7E5E4",
  },
  lineCompleted: {
    backgroundColor: "#6B4B3E",
  },
});

export default CheckoutStepper;