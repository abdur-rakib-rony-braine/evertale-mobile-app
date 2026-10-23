import { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs/types";
import { Home, Heart, ShoppingBag, User } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICONS = {
  index: Home,
  wishlist: Heart,
  cart: ShoppingBag,
  account: User,
};

const LABELS = {
  index: "Home",
  wishlist: "Wishlist",
  cart: "Cart",
  account: "Account",
};

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const Icon = ICONS[route.name as keyof typeof ICONS];
        const label = LABELS[route.name as keyof typeof LABELS];

        if (!Icon) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
            <Icon
              size={22}
              color={isFocused ? "#AE7857" : "#78716C"}
              strokeWidth={isFocused ? 2.2 : 1.6}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isFocused ? "#AE7857" : "#78716C",
                  fontWeight: isFocused ? "600" : "500",
                },
              ]}
            >
              {label}
            </Text>
            {isFocused && <View style={styles.activeIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    position: "relative",
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    height: 2,
    width: 32,
    backgroundColor: "#AE7857",
    borderRadius: 999,
  },
});