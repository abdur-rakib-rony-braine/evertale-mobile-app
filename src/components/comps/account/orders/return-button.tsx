import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { RefreshCw } from "lucide-react-native";
import { useReturnStore } from "@/store/return-store";
import ReturnDialog from "./return-dialog";

interface ReturnButtonProps {
  order: any;
}

export default function ReturnButton({ order }: ReturnButtonProps) {
  const [open, setOpen] = useState(false);
  const { setCurrentOrder, reset } = useReturnStore();

  const orderDate = new Date(order.createdAt);
  const currentDate = new Date();
  const daysDifference = Math.floor(
    (currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDifference > 30) return null;

  const handleOpen = () => {
    reset();
    setCurrentOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <>
      <Pressable style={styles.btn} onPress={handleOpen}>
        <RefreshCw size={16} color="#AE7857" />
        <Text style={styles.btnText}>Return Items</Text>
      </Pressable>

      <ReturnDialog open={open} onClose={handleClose} />
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