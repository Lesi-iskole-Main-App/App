import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Islandrank from "../components/Islandrank";
import Coins from "../components/Coins";
import FinishedExam from "../components/FinishedExam";
import ProgressBar from "../components/ProgressBar";
import PaperGrid from "../components/PaperGrid";

import useT from "../app/i18n/useT";
import { useGetMyProgressQuery } from "../app/progressApi";
import { useGetMyProfileQuery } from "../app/userApi";

const { height, width } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 90;

/**
 * Keeps birthday popup only once per app session for same user+date
 * Example key: userId_2026-04-17
 */
const shownBirthdayKeys = new Set();

const BALLOONS = [
  { left: width * 0.08, color: "#60A5FA", delay: 0 },
  { left: width * 0.24, color: "#93C5FD", delay: 250 },
  { left: width * 0.42, color: "#BFDBFE", delay: 500 },
  { left: width * 0.62, color: "#3B82F6", delay: 750 },
  { left: width * 0.80, color: "#DBEAFE", delay: 1000 },
];

function Balloon({ left, color, delay }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [delay, floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -22],
  });

  const rotate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-2deg", "2deg"],
  });

  return (
    <Animated.View
      style={[
        styles.balloonWrap,
        {
          left,
          transform: [{ translateY }, { rotate }],
        },
      ]}
    >
      <View style={[styles.balloon, { backgroundColor: color }]} />
      <View style={styles.balloonString} />
    </Animated.View>
  );
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

/**
 * Supports:
 * - Date object
 * - ISO string: 2001-04-17T00:00:00.000Z
 * - simple string: 2001-04-17
 * - dotted string: 2001.04.17
 */
function getBirthdayMonthDay(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();

    // 2001.04.17
    const dotted = trimmed.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
    if (dotted) {
      return {
        month: dotted[2],
        day: dotted[3],
      };
    }

    // 2001-04-17 or ISO
    const dashed = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dashed) {
      return {
        month: dashed[2],
        day: dashed[3],
      };
    }
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  return {
    month: pad2(d.getUTCMonth() + 1),
    day: pad2(d.getUTCDate()),
  };
}

function isTodayBirthday(birthdayValue) {
  const birthday = getBirthdayMonthDay(birthdayValue);
  if (!birthday) return false;

  const now = new Date();
  const todayMonth = pad2(now.getMonth() + 1);
  const todayDay = pad2(now.getDate());

  return birthday.month === todayMonth && birthday.day === todayDay;
}

function getTodayKey(userId) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = pad2(now.getMonth() + 1);
  const dd = pad2(now.getDate());
  return `${userId}_${yyyy}-${mm}-${dd}`;
}

export default function Home() {
  const { t, sinFont } = useT();

  const { data } = useGetMyProgressQuery(undefined, {
    pollingInterval: 20000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data: myProfile } = useGetMyProfileQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const progress = Number(data?.progress || 0);

  const birthdayName = String(myProfile?.name || "").trim();
  const birthdayValue = myProfile?.birthday || null;
  const userId = String(myProfile?._id || myProfile?.id || "");

  const [showBirthday, setShowBirthday] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const textPulse = useRef(new Animated.Value(1)).current;

  const timers = useRef([]);

  useEffect(() => {
    if (!userId) return;
    if (!birthdayValue) return;
    if (!isTodayBirthday(birthdayValue)) return;

    const todayKey = getTodayKey(userId);
    if (shownBirthdayKeys.has(todayKey)) return;

    shownBirthdayKeys.add(todayKey);

    const startTimer = setTimeout(() => {
      setShowBirthday(true);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();

      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(textPulse, {
            toValue: 1.05,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(textPulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      pulseLoop.start();

      const hideTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: 350,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(cardScale, {
            toValue: 0.96,
            duration: 350,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => {
          pulseLoop.stop();
          setShowBirthday(false);
          textPulse.setValue(1);
          cardScale.setValue(0.92);
          overlayOpacity.setValue(0);
        });
      }, 10000); // show for 10 seconds only

      timers.current.push(hideTimer);
    }, 400); // quick show after page load

    timers.current.push(startTimer);

    return () => {
      timers.current.forEach((timerId) => clearTimeout(timerId));
      timers.current = [];
    };
  }, [birthdayValue, userId, overlayOpacity, cardScale, textPulse]);

  const balloons = useMemo(
    () =>
      BALLOONS.map((item, index) => (
        <Balloon
          key={`${item.left}-${index}`}
          left={item.left}
          color={item.color}
          delay={item.delay}
        />
      )),
    []
  );

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.root}>
          <ScrollView
            style={styles.safe}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.screen}>
              <View style={styles.dashboard}>
                <View style={styles.leftCol}>
                  <Islandrank />
                </View>

                <View style={styles.rightCol}>
                  <Coins />
                  <FinishedExam />
                </View>
              </View>

              <View style={styles.progressWrapper}>
                <ProgressBar progress={progress} />
              </View>

              <Text style={[styles.sectionTitle, sinFont("bold")]}>
                {t("paperLibrary")}
              </Text>

              <View style={styles.gridWrapper}>
                <PaperGrid />
              </View>
            </View>
          </ScrollView>

          {showBirthday && (
            <Animated.View
              pointerEvents="auto"
              style={[
                styles.overlay,
                {
                  opacity: overlayOpacity,
                },
              ]}
            >
              <View style={styles.overlayBgTop} />
              <View style={styles.overlayBgBottom} />

              <View style={styles.overlayDecorCircle1} />
              <View style={styles.overlayDecorCircle2} />
              <View style={styles.overlayDecorCircle3} />

              {balloons}

              <Animated.View
                style={[
                  styles.birthdayCard,
                  {
                    transform: [{ scale: cardScale }],
                  },
                ]}
              >
                <Text style={styles.birthdayEmoji}>🎉</Text>

                <Animated.Text
                  style={[
                    styles.birthdayTitle,
                    { transform: [{ scale: textPulse }] },
                  ]}
                >
                  Happy Birthday
                </Animated.Text>

                <Text style={styles.birthdayName}>
                  {birthdayName || "Student"}
                </Text>

                <Text style={styles.birthdaySubtext}>
                  Wishing you joy, smiles, and a beautiful day
                </Text>
              </Animated.View>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  root: {
    flex: 1,
  },

  content: {
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },

  screen: {
    backgroundColor: "#F8FAFC",
  },

  dashboard: {
    height: height * 0.3,
    flexDirection: "row",
    padding: 16,
  },

  leftCol: {
    flex: 1,
    marginRight: 12,
  },

  rightCol: {
    flex: 1,
    justifyContent: "space-between",
  },

  progressWrapper: {
    paddingHorizontal: 16,
    marginTop: 4,
  },

  sectionTitle: {
    marginTop: 12,
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  gridWrapper: {
    paddingBottom: 8,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(248,250,252,0.96)",
  },

  overlayBgTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(219,234,254,0.55)",
  },

  overlayBgBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: "rgba(255,255,255,0.75)",
  },

  overlayDecorCircle1: {
    position: "absolute",
    top: 90,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(191,219,254,0.35)",
  },

  overlayDecorCircle2: {
    position: "absolute",
    top: 150,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(96,165,250,0.18)",
  },

  overlayDecorCircle3: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(219,234,254,0.22)",
  },

  birthdayCard: {
    width: width * 0.84,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.85)",
    shadowColor: "#60A5FA",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  birthdayEmoji: {
    fontSize: 34,
    marginBottom: 10,
  },

  birthdayTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1D4ED8",
    textAlign: "center",
  },

  birthdayName: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  birthdaySubtext: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#334155",
    textAlign: "center",
    paddingHorizontal: 10,
  },

  balloonWrap: {
    position: "absolute",
    bottom: 90,
    alignItems: "center",
  },

  balloon: {
    width: 34,
    height: 44,
    borderRadius: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },

  balloonString: {
    width: 1.5,
    height: 55,
    backgroundColor: "rgba(100,116,139,0.5)",
    marginTop: 2,
  },
});