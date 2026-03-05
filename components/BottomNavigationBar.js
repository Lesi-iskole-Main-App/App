import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import useT from "../app/i18n/useT";

const LMS_SIZE = 90;
const BAR_RADIUS = 24;
const BAR_HEIGHT = 64;

const ICON_COLOR = "#1153ec";

// Do not hide on EnrollSubjects now
const HIDE_BOTTOM_BAR_ON = new Set([]);

export default function BottomNavigationBar() {
  const navigation = useNavigation();
  const { t, navFont } = useT();

  // all hooks must run every render in the same order
  const currentRouteName = useNavigationState(
    (state) => state.routes[state.index]?.name
  );

  const userFromUserSlice = useSelector((s) => s?.user?.user);
  const userFromAuthSlice = useSelector((s) => s?.auth?.user);
  const user = userFromUserSlice || userFromAuthSlice || null;

  const level = user?.selectedLevel || user?.level || null;

  const isAL = String(level || "").toLowerCase() === "al";
  const showLMS = !isAL;
  const showLive = !isAL;

  if (HIDE_BOTTOM_BAR_ON.has(currentRouteName)) return null;

  return (
    <View style={styles.root}>
      <View style={styles.shadowContainer}>
        <View style={[styles.bar, !showLMS && styles.barNoLms]}>
          <NavItem
            icon="home"
            label={t("navHome")}
            labelStyle={navFont("bold")}
            onPress={() => navigation.navigate("Home")}
          />

          {showLive && (
            <NavItem
              icon="radio"
              label={t("navLive")}
              labelStyle={navFont("bold")}
              onPress={() => navigation.navigate("Live")}
            />
          )}

          {showLMS && <View style={styles.slotCenter} />}

          <NavItem
            icon="bar-chart"
            label={t("navResult")}
            labelStyle={navFont("bold")}
            onPress={() => navigation.navigate("Result")}
          />

          <NavItem
            icon="clipboard"
            label={t("navEnroll")}
            labelStyle={navFont("bold")}
            onPress={() => navigation.navigate("Registersubject")}
          />
        </View>
      </View>

      {showLMS && (
        <Pressable
          onPress={() => navigation.navigate("LMS")}
          style={({ pressed }) => [
            styles.centerButton,
            pressed && styles.centerPressed,
          ]}
        >
          <Ionicons name="school" size={36} color={ICON_COLOR} />
          <Text style={[styles.centerLabel, navFont("bold")]}>
            {t("navLms")}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function NavItem({ icon, label, onPress, labelStyle }) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Ionicons name={icon} size={28} color={ICON_COLOR} />
      <Text style={[styles.text, labelStyle]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    alignItems: "center",
  },

  shadowContainer: {
    width: "100%",
    borderRadius: BAR_RADIUS,
    elevation: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },

  bar: {
    height: BAR_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderRadius: BAR_RADIUS,
    flexDirection: "row",
    alignItems: "center",
  },

  barNoLms: {
    paddingHorizontal: 6,
  },

  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  slotCenter: {
    width: LMS_SIZE,
  },

  text: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: "#1153ec",
  },

  centerButton: {
    position: "absolute",
    top: -LMS_SIZE / 2 + 12,
    width: LMS_SIZE,
    height: LMS_SIZE,
    borderRadius: LMS_SIZE / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  centerPressed: {
    opacity: Platform.OS === "ios" ? 0.85 : 1,
  },

  centerLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "900",
    color: "#1153ec",
  },
});