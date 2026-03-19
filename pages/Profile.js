import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { useSelector } from "react-redux";

import profile from "../assets/profile.png";
import useT from "../app/i18n/useT";
import ReviewComponent from "../components/ReviewComponent";

// ✅ match your BottomNavigation height
const TAB_BAR_HEIGHT = 90;

export default function Profile({ route }) {
  const [fontsLoaded] = useFonts({
    FMEmanee: require("../assets/fonts/FMEmaneex.ttf"),
  });

  const { t, lang, sinFont } = useT();
  const isSi = lang === "si";

  // ✅ get logged user from redux (no context)
  const userFromUserSlice = useSelector((s) => s?.user?.user);
  const userFromAuthSlice = useSelector((s) => s?.auth?.user); // optional fallback
  const user = userFromUserSlice || userFromAuthSlice || null;

  // ✅ normalize for UI
  const name = user?.name || "—";

  const gradeNumber =
    user?.selectedGradeNumber ?? user?.gradeNumber ?? user?.grade ?? null;

  const level = user?.selectedLevel || user?.level || null;
  const stream = user?.selectedStream || user?.stream || "";

  const district = user?.district || "";
  const town = user?.town || "";

  const gradeText = gradeNumber ? String(gradeNumber) : "—";

  // ✅ show stream only if A/L
  const showStream = level === "al" && String(stream || "").trim().length > 0;

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.container}>
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <Image source={profile} style={styles.avatar} />
            </View>

            {/* Details Card */}
            <View style={styles.detailsCard}>
              {/* Row 1: Name + Grade */}
              <View style={styles.twoColRow}>
                <View style={styles.leftCol}>
                  <Text>
                    <Text style={[styles.label, isSi ? sinFont("bold") : null]}>
                      {t("nameLbl")}
                    </Text>
                    {" : "}
                    <Text style={styles.value}>{name}</Text>
                  </Text>
                </View>

                <View style={styles.rightCol}>
                  <Text>
                    <Text style={[styles.label, isSi ? sinFont("bold") : null]}>
                      {t("gradeLbl")}
                    </Text>
                    {" : "}
                    <Text style={styles.value}>{gradeText}</Text>
                  </Text>
                </View>
              </View>

              {/* Row 2: District + Town */}
              <View style={[styles.twoColRow, { marginTop: 5 }]}>
                <View style={styles.leftCol}>
                  <Text>
                    <Text style={[styles.label, isSi ? sinFont("bold") : null]}>
                      {t("districtLbl")}
                    </Text>
                    {" : "}
                    <Text style={styles.value}>{district || "—"}</Text>
                  </Text>

                  <Text style={styles.value}>{district ? "" : ""}</Text>
                </View>

                <View style={styles.rightCol}>
                  <Text>
                    <Text style={[styles.label, isSi ? sinFont("bold") : null]}>
                      {t("townLbl")}
                    </Text>
                    {" : "}
                    <Text style={styles.value}>{town || "—"}</Text>
                  </Text>

                  {showStream && (
                    <Text style={{ marginTop: 6 }}>
                      <Text
                        style={[styles.label, isSi ? sinFont("bold") : null]}
                      >
                        {t("streamLbl")}
                      </Text>
                      {" : "}
                      <Text style={styles.value}>{stream}</Text>
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.reviewWrap}>
              <ReviewComponent />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingBottom: TAB_BAR_HEIGHT + 10,
  },

  container: {
    alignItems: "center",
    paddingTop: 10,
  },

  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#D9D9D9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },

  avatar: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },

  detailsCard: {
    width: "90%",
    backgroundColor: "#D9D9D9",
    borderRadius: 16,
    padding: 16,
  },

  reviewWrap: {
    width: "100%",
    marginTop: 14,
  },

  twoColRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  leftCol: { width: "58%" },

  rightCol: {
    width: "38%",
    alignItems: "flex-start",
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  value: {
    fontSize: 14,
    color: "#0F172A",
  },

  sinhalaText: {
    fontFamily: "FMEmanee",
    fontSize: 16,
    color: "#0F172A",
    marginTop: 20,
    marginBottom: -8,
    textAlign: "center",
    width: "90%",
    lineHeight: 22,
  },
});