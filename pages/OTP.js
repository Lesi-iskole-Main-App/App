import React, { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import {
  useVerifySignupOtpMutation,
  useVerifyForgotOtpMutation,
} from "../app/authApi";

import useT from "../app/i18n/useT";

const BG_INPUT = "#F1F5F9";
const PLACEHOLDER = "#97A4B8";
const PRIMARY = "#214294";

const maskPhone = (value) => {
  const p = String(value || "").trim();
  if (!p) return "07xxxxx";
  if (p.includes("@")) {
    const [name, domain] = p.split("@");
    const visible = (name || "").slice(0, 2);
    return `${visible}***@${domain || ""}`;
  }
  const first2 = p.slice(0, 2) || "07";
  return `${first2}xxxxx`;
};

export default function OTP({ navigation, route }) {
  const { lang, t, sinFont } = useT();

  const phoneOrId = route?.params?.phone || route?.params?.identifier || "";
  const flow = route?.params?.flow || "signup";
  const masked = useMemo(() => maskPhone(phoneOrId), [phoneOrId]);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [loading, setLoading] = useState(false);

  const [verifySignupOtp] = useVerifySignupOtpMutation();
  const [verifyForgotOtp] = useVerifyForgotOtpMutation();

  const codeValue = useMemo(() => otp.join(""), [otp]);

  const subtitle = useMemo(() => {
    if (lang === "si") {
      return (t("otpSubtitle_si") || "").replace("{masked}", masked);
    }
    return (t("otpSubtitle_en") || "").replace("{masked}", masked);
  }, [lang, masked, t]);

  const onChangeDigit = (text, index) => {
    const digit = (text || "").replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace") {
      const next = [...otp];

      if (!otp[index] && index > 0) {
        next[index - 1] = "";
        setOtp(next);
        inputsRef.current[index - 1]?.focus();
      } else {
        next[index] = "";
        setOtp(next);
      }
    }
  };

  const onBackToSign = () => {
    navigation.replace("Sign", {
      mode: flow === "forgot" ? "signin" : "signup",
      phone: phoneOrId,
    });
  };

  const onVerify = async () => {
    const code = codeValue.trim();
    if (code.length !== 6) {
      Alert.alert("OTP", "Please enter 6 digit code");
      return;
    }

    try {
      setLoading(true);

      if (flow === "signup") {
        await verifySignupOtp({ phonenumber: phoneOrId, code }).unwrap();
        navigation.replace("MainSelectgrade");
        return;
      }

      await verifyForgotOtp({ identifier: phoneOrId, code }).unwrap();

      navigation.replace("ForgotPassword", {
        step: "reset",
        identifier: phoneOrId,
        code,
      });
    } catch (e) {
      const msg =
        e?.data?.message || e?.message || "OTP verification failed";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>OTP Verification</Text>

        <Text
          style={[
            styles.subTitle,
            lang === "si" ? sinFont("regular") : null,
          ]}
        >
          {subtitle}
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(r) => (inputsRef.current[idx] = r)}
              value={digit}
              onChangeText={(t) => onChangeDigit(t, idx)}
              onKeyPress={(e) => onKeyPress(e, idx)}
              keyboardType="number-pad"
              placeholder="•"
              placeholderTextColor={PLACEHOLDER}
              maxLength={1}
              style={styles.otpBox}
            />
          ))}
        </View>

        <Pressable
          onPress={onVerify}
          style={styles.gradientBtnOuter}
          disabled={loading}
        >
          <LinearGradient
            colors={[
              "#086DFF",
              "#5E9FFD",
              "#7DB1FC",
              "#62C4F6",
              "#48D7F0",
              "#C7F4F8",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.gradientBtnText}>Verify</Text>
            )}
          </LinearGradient>
        </Pressable>

        <Pressable onPress={onBackToSign} style={styles.backWrap}>
          <Text
            style={[
              styles.backText,
              lang === "si" ? sinFont("bold") : null,
            ]}
          >
            {t("back")}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: PRIMARY,
  },
  subTitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 18,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 18,
  },
  otpBox: {
    width: 44,
    height: 50,
    borderRadius: 12,
    backgroundColor: BG_INPUT,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    includeFontPadding: false,
    paddingVertical: 0,
  },
  gradientBtnOuter: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 6,
  },
  gradientBtn: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  gradientBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  backWrap: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: "800",
  },
});