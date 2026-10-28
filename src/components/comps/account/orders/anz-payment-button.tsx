import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { WebView } from "react-native-webview";
import { CreditCard, X } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { apiClient } from "@/lib/api/client";
import { useExchangeStore } from "@/store/exchange-store";

interface AnzPaymentButtonProps {
    orderId: string;
    amount: number;
    exchangeShippingMethod: any;
    returnShippingMethod: any;
    reason: string;
    selectedProducts: any[];
    newProducts: any[];
    isRefundAble: boolean;
    onPaymentSuccess: (data: any) => void;
    onClose: () => void;
}

const isProduction = process.env.NODE_ENV === "production";
const FALLBACK_ORIGIN = isProduction
    ? "https://payment.anzworldline-solutions.com.au"
    : "https://payment.preprod.anzworldline-solutions.com.au";

const getScriptOrigin = (url: string | null) => {
    if (!url) return FALLBACK_ORIGIN;
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const match = normalized.match(/^(https?:\/\/[^/]+)/i);
    return match ? match[1] : FALLBACK_ORIGIN;
};

const buildHtml = (hostedTokenizationUrl: string, amountLabel: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 0;
        background-color: #FFFFFF;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .container { padding: 20px; max-width: 600px; margin: 0 auto; }
      .header { font-size: 22px; font-weight: 600; color: #111827; margin-bottom: 24px; }
      #div-hosted-tokenization-exchange { width: 100%; min-height: 400px; margin-bottom: 24px; }
      #div-hosted-tokenization-exchange iframe {
        width: 100% !important;
        height: 400px !important;
        border: none !important;
        display: block;
        background: #FFFFFF !important;
      }
      .pay-btn {
        display: block;
        width: 100%;
        padding: 16px;
        background-color: #AE7857;
        color: white;
        font-weight: 600;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        text-align: center;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .pay-btn:disabled { background-color: #D1D5DB; cursor: not-allowed; box-shadow: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Complete Payment</div>
      <div id="div-hosted-tokenization-exchange"></div>
      <button id="pay-btn" class="pay-btn" disabled>${amountLabel}</button>
    </div>
    <script>
      (function () {
        var tokenizationUrl = ${JSON.stringify(hostedTokenizationUrl)};
        var scriptOrigin = ${JSON.stringify(getScriptOrigin(hostedTokenizationUrl))};
        var payLabel = ${JSON.stringify(amountLabel)};
        var payBtn = document.getElementById("pay-btn");
        var tokenizer = null;
        var initialized = false;

        function send(message) {
          window.ReactNativeWebView.postMessage(message);
        }

        function log(message) {
          send("TOKENIZATION_LOG:" + message);
        }

        window.onerror = function (message) {
          log("window.onerror " + message);
        };

        function resetButton() {
          payBtn.disabled = false;
          payBtn.innerText = payLabel;
        }

        function wait(ms) {
          return new Promise(function (resolve) { setTimeout(resolve, ms); });
        }

        function isHandshakeError(message) {
          return /handshake/i.test(String(message || ""));
        }

        function submit(attempt) {
          return tokenizer.submitTokenization().then(function (result) {
            var message = result && result.error ? result.error.message : "";
            if (!result.success && attempt < 1 && isHandshakeError(message)) {
              log("handshake failed, retrying");
              return wait(700).then(function () { return submit(attempt + 1); });
            }
            return result;
          }).catch(function (err) {
            if (attempt < 1 && isHandshakeError(err && err.message)) {
              log("handshake rejected, retrying");
              return wait(700).then(function () { return submit(attempt + 1); });
            }
            throw err;
          });
        }

        function start() {
          if (initialized) return;
          initialized = true;
          try {
            tokenizer = new Tokenizer(tokenizationUrl, "div-hosted-tokenization-exchange", {
              hideCardholderName: false,
              validationCallback: function (result) {
                payBtn.disabled = !result.valid;
              },
              loadCallback: function () {
                log("iframe loaded");
              }
            });

            tokenizer.initialize().then(function () {
              log("initialized");
            }).catch(function (e) {
              send("TOKENIZATION_FAILED:" + (e && e.message ? e.message : "Initialization failed"));
            });

            payBtn.onclick = function () {
              payBtn.disabled = true;
              payBtn.innerText = "Processing...";
              submit(0).then(function (result) {
                if (result.success) {
                  send("TOKENIZATION_SUCCESS:" + String(result.hostedTokenizationId || ""));
                } else {
                  var errMsg = result.error ? (result.error.message || "Tokenization rejected") : "No token returned";
                  send("TOKENIZATION_FAILED:" + errMsg);
                  resetButton();
                }
              }).catch(function (err) {
                send("TOKENIZATION_FAILED:" + ((err && err.message) || "Submit exception"));
                resetButton();
              });
            };
          } catch (e) {
            send("TOKENIZATION_FAILED:Setup exception: " + e.message);
          }
        }

        var script = document.createElement("script");
        script.src = scriptOrigin + "/hostedtokenization/js/client/tokenizer.min.js";
        script.onload = start;
        script.onerror = function () {
          send("TOKENIZATION_FAILED:Could not load tokenizer script from " + scriptOrigin);
        };
        document.head.appendChild(script);
        log("tokenizer script " + script.src);
      })();
    </script>
  </body>
</html>
`;

export default function AnzPaymentButton({
    orderId,
    amount,
    exchangeShippingMethod,
    returnShippingMethod,
    reason,
    selectedProducts,
    newProducts,
    isRefundAble,
    onPaymentSuccess,
    onClose,
}: AnzPaymentButtonProps) {
    const { reset } = useExchangeStore();
    const insets = useSafeAreaInsets();

    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [hostedTokenizationUrl, setHostedTokenizationUrl] = useState<string | null>(null);
    const [hostedTokenizationId, setHostedTokenizationId] = useState<string | null>(null);

    const webViewSource = useMemo(() => {
        if (!hostedTokenizationUrl) return null;
        return {
            html: buildHtml(hostedTokenizationUrl, `Pay $${Number(amount).toFixed(2)}`),
            baseUrl: "https://evertale.com.au",
        };
    }, [hostedTokenizationUrl, amount]);

    const handleOpenPayment = async () => {
        setIsInitializing(true);
        try {
            const response = await apiClient.post("/api/exchange-payment", {
                amount,
                orderId,
                exchangeData: { selectedProducts, newProducts },
            });

            if (response.data.hostedTokenizationUrl) {
                setHostedTokenizationUrl(response.data.hostedTokenizationUrl);
                setHostedTokenizationId(response.data.hostedTokenizationId);
                setShowPaymentForm(true);
            } else {
                throw new Error("No tokenization URL received");
            }
        } catch (error: any) {
            const payload = error.response?.data;
            console.log("[anz] init failed", error.response?.status, JSON.stringify(payload));
            Toast.show({
                type: "error",
                text1: payload?.error || payload?.message || error.message || "Failed to initialize payment",
            });
        } finally {
            setIsInitializing(false);
        }
    };

    const closeForm = () => {
        setShowPaymentForm(false);
        setHostedTokenizationUrl(null);
        setHostedTokenizationId(null);
    };

    const handleWebViewMessage = async (event: any) => {
        const data: string = event.nativeEvent.data;
        if (data === "CLOSE_MODAL") {
            closeForm();
        } else if (data.startsWith("TOKENIZATION_LOG:")) {
            console.log("[anz]", data.replace("TOKENIZATION_LOG:", ""));
        } else if (data.startsWith("TOKENIZATION_SUCCESS:")) {
            const token = data.replace("TOKENIZATION_SUCCESS:", "");
            if (token) {
                await submitPaymentToBackend(token);
            } else {
                Toast.show({ type: "error", text1: "Token empty. Please try again." });
                closeForm();
            }
        } else if (data.startsWith("TOKENIZATION_FAILED:")) {
            const errorDetail = data.replace("TOKENIZATION_FAILED:", "");
            console.log("[anz] failed", errorDetail);
            Toast.show({ type: "error", text1: `Payment failed: ${errorDetail}` });
        }
    };

    const submitPaymentToBackend = async (hostedTokenizationIdResult: string) => {
        setIsSubmitting(true);

        const numericAmount = Number(amount);
        const payload = {
            hostedTokenizationId: hostedTokenizationIdResult || hostedTokenizationId,
            orderId,
            amount: numericAmount,
            exchangeShippingMethod,
            returnShippingMethod,
            reason,
            selectedProducts,
            newProducts,
            isRefundAble,
        };

        console.log("[anz] base url", apiClient.defaults?.baseURL, process.env.EXPO_PUBLIC_API_URL);
        console.log("[anz] amount raw", amount, typeof amount);
        console.log("[anz] amount number", numericAmount, "x100", numericAmount * 100, "rounded", Math.round(numericAmount * 100), "isInteger", Number.isInteger(Math.round(numericAmount * 100)));
        console.log("[anz] put payload", JSON.stringify(payload));

        try {
            const response = await apiClient.put("/api/exchange-payment", payload);

            console.log("[anz] put response", response.status, JSON.stringify(response.data));
            const data = response.data;

            if (data.success) {
                Toast.show({ type: "success", text1: "Exchange payment completed!" });
                onPaymentSuccess(data);
                closeForm();
                reset();
                onClose();
            } else {
                throw new Error(data.message || "Exchange payment failed");
            }
        } catch (error: any) {
            const errorPayload = error.response?.data;
            console.log("[anz] put failed", error.response?.status, JSON.stringify(errorPayload));
            Toast.show({
                type: "error",
                text1: errorPayload?.message || errorPayload?.details || errorPayload?.error || error.message || "Payment failed",
            });
            closeForm();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Pressable
                style={styles.payBtn}
                onPress={handleOpenPayment}
                disabled={isInitializing || isSubmitting}
            >
                {isInitializing ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <>
                        <CreditCard size={18} color="#FFFFFF" />
                        <Text style={styles.payBtnText}>PAY ${Number(amount).toFixed(2)}</Text>
                    </>
                )}
            </Pressable>

            <Modal
                visible={showPaymentForm}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={closeForm}
            >
                <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Secure Checkout</Text>
                        <Pressable onPress={closeForm} hitSlop={10} style={styles.closeBtn}>
                            <X size={24} color="#78716C" />
                        </Pressable>
                    </View>

                    {isSubmitting || !webViewSource ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#AE7857" />
                            <Text style={styles.loadingText}>Processing Payment...</Text>
                        </View>
                    ) : (
                        <WebView
                            originWhitelist={["*"]}
                            source={webViewSource}
                            onMessage={handleWebViewMessage}
                            style={{ flex: 1 }}
                            javaScriptEnabled
                            domStorageEnabled
                            thirdPartyCookiesEnabled
                            sharedCookiesEnabled
                            paymentRequestEnabled
                            mixedContentMode="always"
                            setSupportMultipleWindows={false}
                            scrollEnabled
                            bounces
                            showsVerticalScrollIndicator
                            startInLoadingState
                            renderLoading={() => (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#AE7857" />
                                    <Text style={styles.loadingText}>Loading secure form...</Text>
                                </View>
                            )}
                        />
                    )}
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    payBtn: {
        height: 48,
        backgroundColor: "#AE7857",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 12,
    },
    payBtnText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
        letterSpacing: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F4",
        backgroundColor: "#FFFFFF",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#292524",
    },
    closeBtn: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#78716C",
    },
});