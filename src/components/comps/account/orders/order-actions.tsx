import { StyleSheet, View } from "react-native";

import BuyAgainButton from "./buy-again-button";
import { isWithin30Days } from "./order-utils";

interface OrderActionsProps {
  order: any;
}

export default function OrderActions({ order }: OrderActionsProps) {
  const withinWindow = isWithin30Days(order?.createdAt);

  const hasReturnEligibleProducts =
    (order?.returnableProducts?.length || 0) > 0 && withinWindow;
  const hasExchangeEligibleProducts =
    (order?.exchangeableProducts?.length || 0) > 0 && withinWindow;

  return (
    <View style={styles.container}>
      <BuyAgainButton order={order} />
      {hasReturnEligibleProducts ? null : null}
      {hasExchangeEligibleProducts ? null : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    gap: 8,
    width: "100%",
  },
});