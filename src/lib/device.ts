import * as Localization from "expo-localization";
import { Dimensions, Platform } from "react-native";

export const isIOS = () => Platform.OS === "ios";
export const isAndroid = () => Platform.OS === "android";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

export const TIMEZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone ||
  Localization.getCalendars()?.[0]?.timeZone ||
  "UTC";
