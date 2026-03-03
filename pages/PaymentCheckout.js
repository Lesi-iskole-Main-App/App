// src/pages/PaymentCheckout.js ✅ FULL FILE

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCreateCheckoutMutation } from "../app/paymentApi";

let WebView = null;
if (Platform.OS !== "web") {
  WebView = require("react-native-webview").WebView;
}

const PRIMARY = "#1153ec";

// ✅ build HTML that auto-submits a POST form to PayHere
function buildAutoPostHtml(gatewayUrl, fields) {
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const inputs = Object.entries(fields || {})
    .map(
      ([k, v]) =>
        `<input type="hidden" name="${esc(k)}" value="${esc(v)}" />`
    )
    .join("\n");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PayHere</title>
  </head>
  <body style="font-family:Arial;margin:0;padding:24px;">
    <p style="font-size:14px;font-weight:700;color:#334155;">Redirecting to PayHere...</p>
    <form id="payhereForm" method="POST" action="${esc(gatewayUrl)}">
      ${inputs}
    </form>
    <script>
      (function(){
        document.getElementById("payhereForm").submit();
      })();
    </script>
  </body>
</html>`;
}

export default function PaymentCheckout({ route }) {
  const navigation = useNavigation();

  const { paperId, title, amount } = route?.params || {};
  const [createCheckout, { isLoading }] = useCreateCheckoutMutation();

  const [html, setHtml] = useState("");
  const didStartRef = useRef(false);

  const safeTitle = useMemo(() => String(title || "Payment"), [title]);

  useEffect(() => {
    if (didStartRef.current) return;
    didStartRef.current = true;

    (async () => {
      try {
        if (!paperId) {
          Alert.alert("Error", "paperId missing");
          navigation.goBack();
          return;
        }

        const res = await createCheckout({ paperId }).unwrap();

        const gatewayUrl = String(res?.gatewayUrl || "");
        const fields = res?.fields || {};

        if (!gatewayUrl) throw new Error("gatewayUrl not returned");

        // ✅ PayHere mandatory fields check (you already validate hash)
        if (!fields?.merchant_id || !fields?.order_id || !fields?.hash) {
          throw new Error("PayHere fields missing (merchant_id/order_id/hash)");
        }

        // ✅ WEB: real POST form submit (PayHere needs POST, not GET)
        if (Platform.OS === "web") {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = gatewayUrl;

          Object.entries(fields).forEach(([k, v]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = k;
            input.value = String(v ?? "");
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
          return;
        }

        // ✅ MOBILE: auto POST inside WebView using HTML
        const page = buildAutoPostHtml(gatewayUrl, fields);
        setHtml(page);
      } catch (e) {
        console.log("createCheckout error:", e);
        const msg = e?.data?.message || e?.message || "Checkout failed";
        Alert.alert("Payment Error", msg);
        navigation.goBack();
      }
    })();
  }, [paperId, createCheckout, navigation]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{safeTitle}</Text>
          <Text style={styles.subTitle}>
            {Number(amount || 0)
              ? `Amount: Rs ${Number(amount || 0)}`
              : "Secure checkout"}
          </Text>
        </View>
      </View>

      {/* ✅ Loading */}
      {isLoading && !html ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.info}>Preparing PayHere checkout...</Text>
        </View>
      ) : Platform.OS !== "web" && html ? (
        <View style={styles.webWrap}>
          <WebView
            originWhitelist={["*"]}
            source={{ html }}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            renderLoading={() => (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={styles.info}>Loading PayHere...</Text>
              </View>
            )}
            onNavigationStateChange={(navState) => {
              const url = String(navState?.url || "");

              // ✅ When PayHere hits your backend return/cancel pages
              // (these URLs must match what backend sends to PayHere)
              if (url.includes("/api/payment/return")) {
                Alert.alert(
                  "Payment",
                  "Payment completed. Go back and the paper will unlock."
                );
                navigation.goBack();
              }

              if (url.includes("/api/payment/cancel")) {
                Alert.alert("Payment", "Payment cancelled.");
                navigation.goBack();
              }
            }}
            onError={(e) => {
              console.log("WebView error:", e?.nativeEvent);
              Alert.alert("Payment Error", "WebView failed to load PayHere.");
              navigation.goBack();
            }}
          />
        </View>
      ) : (
        // ✅ WEB fallback text (because redirect happens in browser)
        <View style={styles.center}>
          <Text style={styles.info}>PayHere checkout opened in browser.</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.doneBtn}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  title: { fontSize: 16, fontWeight: "900", color: "#0F172A" },
  subTitle: { marginTop: 2, fontSize: 12, fontWeight: "700", color: "#64748B" },

  webWrap: { flex: 1, overflow: "hidden" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  info: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    textAlign: "center",
  },

  doneBtn: {
    marginTop: 12,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: { color: "#FFFFFF", fontWeight: "900", fontSize: 12 },
});