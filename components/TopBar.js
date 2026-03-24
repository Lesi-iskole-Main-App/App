import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  Easing,
  Pressable,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import lesiiskole_logo from "../assets/lesiiskole_logo.png";

import { useSignoutMutation } from "../app/authApi";
import { clearAuth } from "../app/features/authSlice";
import { setUser } from "../app/features/userSlice";
import useT from "../app/i18n/useT";

const { width } = Dimensions.get("window");

export default function TopBar() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { t: translate } = useT();
  const shine = useRef(new Animated.Value(0)).current;

  const [signoutApi, { isLoading: loggingOut }] = useSignoutMutation();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shine, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(9100),
        Animated.timing(shine, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [shine]);

  const translateX = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 180],
  });

  const goProfile = () => {
    navigation.navigate("Profile");
  };

  const doLocalLogout = () => {
    dispatch(clearAuth());
    dispatch(setUser(null));

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Sign", params: { mode: "signup" } }],
      })
    );
  };

  const runLogout = async () => {
    if (busy || loggingOut) return;

    try {
      setBusy(true);
      await signoutApi().unwrap();
    } catch (e) {
      console.log("signout api failed:", e);
    } finally {
      doLocalLogout();
      setBusy(false);
    }
  };

  const handleLogout = () => {
    if (busy || loggingOut) return;

    const logoutTitle = translate("logout") || "Logout";
    const logoutConfirm =
      translate("logoutConfirm") || "Are you sure you want to logout?";
    const cancelText = translate("cancel") || "Cancel";

    if (Platform.OS === "web") {
      const ok = window.confirm(logoutConfirm);
      if (ok) runLogout();
      return;
    }

    Alert.alert(logoutTitle, logoutConfirm, [
      {
        text: cancelText,
        style: "cancel",
      },
      {
        text: logoutTitle,
        onPress: runLogout,
      },
    ]);
  };

  return (
    <View
      style={[
        styles.topBar,
        {
          paddingTop: insets.top,
          height: 70 + insets.top,
        },
      ]}
    >
      <View style={styles.logoWrap}>
        <Image
          source={lesiiskole_logo}
          style={styles.logo}
          resizeMode="contain"
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.glareWrap,
            { transform: [{ translateX }, { rotate: "-25deg" }] },
          ]}
        >
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0.85)",
              "rgba(255,255,255,0)",
            ]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.glare}
          />
        </Animated.View>
      </View>

      <View style={styles.rightActions}>
        <Pressable onPress={goProfile} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="person-circle-outline" size={30} color="#1153ec" />
        </Pressable>

        <Pressable
          onPress={handleLogout}
          hitSlop={10}
          disabled={busy || loggingOut}
          style={({ pressed }) => [
            styles.logoutBtn,
            (busy || loggingOut) && styles.logoutBtnDisabled,
            pressed && !(busy || loggingOut) ? styles.logoutBtnPressed : null,
          ]}
        >
          {busy || loggingOut ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
              <Text style={styles.logoutText}>
                {translate("logout") || "Logout"}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width,
    backgroundColor: "#FDFEFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logoWrap: {
    width: 150,
    height: 46,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
  },

  logo: {
    width: "100%",
    height: "100%",
  },

  glareWrap: {
    position: "absolute",
    top: -40,
    left: 0,
    width: 90,
    height: 140,
    opacity: 0.55,
  },

  glare: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },

  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBtn: {
    padding: 6,
    borderRadius: 999,
    marginRight: 8,
  },

  logoutBtn: {
    minWidth: 108,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#214294",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  logoutBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },

  logoutBtnDisabled: {
    opacity: 0.7,
  },

  logoutText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
});