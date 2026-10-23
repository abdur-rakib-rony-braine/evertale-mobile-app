import { StyleSheet, View } from "react-native";

import BuyAgainButton from "./buy-again-button";
import ExchangeButton from "./exchange-button";
import ReturnButton from "./return-button";
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
      {hasReturnEligibleProducts && <ReturnButton order={order} />}
      {hasExchangeEligibleProducts && <ExchangeButton order={order} />}
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