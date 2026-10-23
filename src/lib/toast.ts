import Toast from "react-native-toast-message";

export const showSuccess = (message: string) => {
  Toast.show({
    type: "success",
    text1: message,
    position: "bottom",
    visibilityTime: 3000,
  });
};

export const showError = (message: string) => {
  Toast.show({
    type: "error",
    text1: message,
    position: "bottom",
    visibilityTime: 3000,
  });
};

export const showErrorFromException = (
  error: unknown,
  fallback = "Something went wrong! please try again"
) => {
  const message =
    (typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string" &&
      (error as { message: string }).message) ||
    fallback;

  showError(message);
};