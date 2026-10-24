import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { RefreshCw } from "lucide-react-native";
import { useExchangeStore } from "@/store/exchange-store";
import ExchangeDialog from "./exchange-dialog";

interface ExchangeButtonProps {
  order: any;
}

export default function ExchangeButton({ order }: ExchangeButtonProps) {
  const [open, setOpen] = useState(false);
  const { setCurrentOrder, reset } = useExchangeStore();

  const handleOpen = () => {
    reset();
    setCurrentOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Pressable style={styles.btn} onPress={handleOpen}>
        <RefreshCw size={16} color="#AE7857" />
        <Text style={styles.btnText}>Exchange Items</Text>
      </Pressable>

      <ExchangeDialog open={open} onClose={handleClose} />
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#AE7857",
    backgroundColor: "#FFFFFF",
  },
  btnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#AE7857",
  },
});