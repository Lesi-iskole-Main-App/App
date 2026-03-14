import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import { useSelector, useDispatch } from "react-redux";

import { clearGradeSelection } from "../app/features/authSlice";
import { updateUserFields, setUser } from "../app/features/userSlice";
import { useSaveStudentGradeSelectionMutation } from "../app/userApi";

import useT from "../app/i18n/useT";

/* ✅ Ribbon with centered number */
function RibbonV({ color = "#F97316", number = "01" }) {
  return (
    <View style={styles.ribbonWrap}>
      <Svg width={60} height={47} viewBox="0 0 60 47">
        <Path
          d="
            M0 0
            H60
            L46 23.5
            L60 47
            H0
            Z
          "
          fill={color}
        />
      </Svg>

      <View pointerEvents="none" style={styles.ribbonNumberCenter}>
        <Text style={styles.ribbonNumber}>{number}</Text>
      </View>
    </View>
  );
}

const parseGradeNumber = (gradeLabel) => {
  const m = String(gradeLabel || "").match(/(\d{1,2})/);
  return m ? Number(m[1]) : null;
};

const normalizeStreamKey = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
};

export default function LMS() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { t, lang, sinFont } = useT();

  const userFromUserSlice = useSelector((s) => s?.user?.user);
  const userFromAuthSlice = useSelector((s) => s?.auth?.user);
  const user = userFromUserSlice || userFromAuthSlice || null;

  const token = useSelector((s) => s?.auth?.token);

  const selectedLevel = useSelector((s) => s?.auth?.selectedLevel);
  const selectedGrade = useSelector((s) => s?.auth?.selectedGrade);
  const selectedStream = useSelector((s) => s?.auth?.selectedStream);

  const [saveGradeSelection] = useSaveStudentGradeSelectionMutation();
  const [saving, setSaving] = useState(false);

  const level = user?.selectedLevel || user?.level || selectedLevel || null;
  const gradeNumberDb =
    user?.selectedGradeNumber ?? user?.gradeNumber ?? user?.grade ?? null;
  const streamDb = user?.selectedStream || selectedStream || "";

  const translatedStreamName = useMemo(() => {
    const raw = String(streamDb || "").trim();
    if (!raw) return "";

    const key = normalizeStreamKey(raw);

    const knownStreamKeys = [
      "physical_science",
      "biological_science",
      "commerce",
      "arts",
      "technology",
      "common",
    ];

    if (lang === "si" && knownStreamKeys.includes(key)) {
      return t(key);
    }

    return raw;
  }, [streamDb, lang, t]);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      if (user?.role && user.role !== "student") return;
      if (user?.gradeSelectionLocked) return;

      try {
        if (selectedLevel === "al") {
          const cleanStream = String(selectedStream || "").trim();
          if (!cleanStream) return;

          setSaving(true);

          const resp = await saveGradeSelection({
            level: "al",
            gradeNumber: 12,
            stream: cleanStream,
          }).unwrap();

          if (resp?.user) {
            dispatch(setUser(resp.user));
            dispatch(updateUserFields(resp.user));
          }

          dispatch(clearGradeSelection());
          return;
        }

        const gNum = parseGradeNumber(selectedGrade);
        if (!selectedLevel || !gNum) return;

        setSaving(true);

        const resp = await saveGradeSelection({
          level: selectedLevel,
          gradeNumber: gNum,
          stream: null,
        }).unwrap();

        if (resp?.user) {
          dispatch(setUser(resp.user));
          dispatch(updateUserFields(resp.user));
        }

        dispatch(clearGradeSelection());
      } catch (e) {
        const status = e?.status || e?.originalStatus;
        if (status === 409) return;
        console.log("LMS auto-save grade failed:", e);
      } finally {
        setSaving(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    token,
    selectedLevel,
    selectedGrade,
    selectedStream,
    user?.gradeSelectionLocked,
  ]);

  if (level === "al") {
    const selectedStreamName = String(streamDb || "").trim();

    if (!selectedStreamName) {
      return (
        <View style={styles.center}>
          <Text style={[styles.centerTitle, lang === "si" && sinFont("bold")]}>
            {lang === "si" ? "úIh Odrdjla f;darkd නැත" : "No Stream Selected"}
          </Text>
          <Text style={[styles.centerDesc, lang === "si" && sinFont()]}>
            {lang === "si"
              ? "lreKdlr Tnf.a A/L úIh Odrdj f;darkak"
              : "Please select your A/L stream first."}
          </Text>

          <Pressable
            style={styles.backBtn}
            onPress={() => navigation.replace("MainSelectgrade")}
          >
            <Text style={[styles.backBtnText, lang === "si" && sinFont("bold")]}>
              {lang === "si" ? "fY%a‚ f;dard.kSu fj; hkak" : "Go to Grade Selection"}
            </Text>
          </Pressable>

          {!!saving && (
            <Text
              style={[
                styles.centerDesc,
                { marginTop: 10 },
                lang === "si" && sinFont(),
              ]}
            >
              {lang === "si" ? "úIh Odrdj ixl,kh lrñka..." : "Saving stream..."}
            </Text>
          )}
        </View>
      );
    }

    const onOpenALClasses = () => {
      navigation.navigate("EnrollSubjects", {
        grade: "A/L",
        gradeNumber: 12,
        subjectName: "",
        streamName: selectedStreamName,
      });
    };

    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Pressable style={styles.fullCard} onPress={onOpenALClasses}>
          <View style={styles.ribbonCorner}>
            <RibbonV color="#0EA5E9" number="AL" />
          </View>

          <View pointerEvents="none" style={styles.absoluteCenter}>
            <Text style={[styles.cardText, lang === "si" && sinFont("bold")]}>
              {translatedStreamName}
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    );
  }

  if (!gradeNumberDb) {
    return (
      <View style={styles.center}>
        <Text style={[styles.centerTitle, lang === "si" && sinFont("bold")]}>
          {lang === "si" ? "fY%a‚hla f;darkd නැත" : "No Grade Selected"}
        </Text>
        <Text style={[styles.centerDesc, lang === "si" && sinFont()]}>
          {lang === "si"
            ? "lreKdlr Tnf.a fY%a‚h f;darkak"
            : "Please select your grade first."}
        </Text>

        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.replace("MainSelectgrade")}
        >
          <Text style={[styles.backBtnText, lang === "si" && sinFont("bold")]}>
            {lang === "si" ? "fY%a‚ f;dard.kSu fj; hkak" : "Go to Grade Selection"}
          </Text>
        </Pressable>

        {!!saving && (
          <Text
            style={[
              styles.centerDesc,
              { marginTop: 10 },
              lang === "si" && sinFont(),
            ]}
          >
            {lang === "si" ? "fY%a‚h ixl,kh lrñka..." : "Saving grade..."}
          </Text>
        )}
      </View>
    );
  }

  const gradeWord = useMemo(() => {
    const g = Number(gradeNumberDb);

    const en = {
      1: "One",
      2: "Two",
      3: "Three",
      4: "Four",
      5: "Five",
      6: "Six",
      7: "Seven",
      8: "Eight",
      9: "Nine",
      10: "Ten",
      11: "Eleven",
      12: "Twelve",
      13: "Thirteen",
    };

    const si = {
      1: t("grade1"),
      2: t("grade2"),
      3: t("grade3"),
      4: t("grade4"),
      5: t("grade5"),
      6: t("grade6"),
      7: t("grade7"),
      8: t("grade8"),
      9: t("grade9"),
      10: t("grade10"),
      11: t("grade11"),
      12: t("grade12"),
      13: t("grade13"),
    };

    if (lang === "si") return si[g] || `${g} ${t("grade")}`;
    return en[g] || String(g);
  }, [gradeNumberDb, lang, t]);

  const fullGradeText = useMemo(() => {
    if (lang === "si") return gradeWord;
    return `Grade ${gradeWord}`;
  }, [gradeWord, lang]);

  const gradeColor = useMemo(() => {
    const colorMap = {
      1: "#F97316",
      2: "#22C55E",
      3: "#3B82F6",
      4: "#A855F7",
      5: "#EF4444",
      6: "#14B8A6",
      7: "#EAB308",
      8: "#0EA5E9",
      9: "#F43F5E",
      10: "#6366F1",
      11: "#10B981",
      12: "#0EA5E9",
      13: "#F97316",
    };
    return colorMap[Number(gradeNumberDb)] || "#3B82F6";
  }, [gradeNumberDb]);

  const numberText = String(gradeNumberDb).padStart(2, "0");
  const gradeLabel = `Grade ${gradeNumberDb}`;

  const onOpenGradeClasses = () => {
    navigation.navigate("EnrollSubjects", {
      grade: gradeLabel,
      gradeNumber: gradeNumberDb,
      subjectName: "",
      streamName: "",
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable style={styles.fullCard} onPress={onOpenGradeClasses}>
        <View style={styles.ribbonCorner}>
          <RibbonV color={gradeColor} number={numberText} />
        </View>

        <View pointerEvents="none" style={styles.absoluteCenter}>
          <Text style={[styles.cardText, lang === "si" && sinFont("bold")]}>
            {fullGradeText}
          </Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },

  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 140,
    justifyContent: "center",
  },

  fullCard: {
    width: "100%",
    minHeight: 90,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    position: "relative",
    marginBottom: 12,
  },

  ribbonCorner: { position: "absolute", top: 0, left: 0, zIndex: 5 },

  absoluteCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  cardText: { fontSize: 22, fontWeight: "900", color: "#0F172A" },

  ribbonWrap: { width: 60, height: 47 },
  ribbonNumberCenter: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 60,
    height: 47,
    alignItems: "center",
    justifyContent: "center",
  },
  ribbonNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginLeft: -9,
  },

  center: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  centerTitle: { fontSize: 20, fontWeight: "900", color: "#0F172A" },
  centerDesc: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
  },
  backBtn: {
    marginTop: 14,
    backgroundColor: "#214294",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
});