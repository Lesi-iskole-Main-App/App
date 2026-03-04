// pages/ModelPaper.js ✅ FULL FILE
// ✅ selector for ModelPaperMenu

import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

import useUser from "../app/hooks/useUser";
import { useGetGradeDetailQuery } from "../app/gradeApi";
import useT from "../app/i18n/useT";

const norm = (v) => String(v || "").trim().toLowerCase();
const TAB_BAR_SPACE = 110;

export default function ModelPaper() {
  const navigation = useNavigation();
  const { user } = useUser();
  const { t, lang, sinFont } = useT();
  const isSi = lang === "si";

  const [selectedSubject, setSelectedSubject] = useState("");

  const level = user?.selectedLevel || null;
  const gradeNumber = Number(user?.selectedGradeNumber || 0) || null;
  const stream = user?.selectedStream || null;

  const isAL = gradeNumber === 12 || gradeNumber === 13 || level === "al";

  const { data: gradeDoc, isLoading, isFetching, error } =
    useGetGradeDetailQuery(gradeNumber, { skip: !gradeNumber });

  const subjectsToShow = useMemo(() => {
    if (!gradeDoc) return [];

    if (!isAL) {
      const list = Array.isArray(gradeDoc?.subjects) ? gradeDoc.subjects : [];
      return list.map((x) => x?.subject).filter(Boolean);
    }

    const streams = Array.isArray(gradeDoc?.streams) ? gradeDoc.streams : [];
    const st = streams.find((s) => norm(s?.stream) === norm(stream));
    const subs = Array.isArray(st?.subjects) ? st.subjects : [];
    return subs.map((x) => x?.subject).filter(Boolean);
  }, [gradeDoc, isAL, stream]);

  const canStart = !!gradeNumber && !!selectedSubject && (!isAL || !!stream);

  const UI = {
    title: isSi ? t("mpTitle") : "Model paper",
    selectSubject: isSi ? t("selectSubject") : "Select Subject",
    grade: isSi ? t("gradeLbl") : "Grade",
    stream: isSi ? t("streamLbl") : "Stream",
    subject: isSi ? t("subjectLbl") : "Subject",
    continue: isSi ? t("continueLbl") : "Continue",
  };

  const onContinue = () => {
    if (!canStart) return;

    navigation.navigate("ModelPaperMenu", {
      level,
      gradeNumber,
      stream: stream || null,
      subject: selectedSubject,
      mode: "model",
    });
  };

  if (!gradeNumber || (isAL && !stream)) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Grade / Stream not selected</Text>
        <Text style={styles.helperText}>
          Please select your grade (and stream for A/L) first.
        </Text>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("MainSelectgrade")}
        >
          <Text style={styles.primaryBtnText}>Go to Grade Selection</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading || isFetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.helperText}>Loading subjects...</Text>
      </View>
    );
  }

  if (error || !gradeDoc) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Subjects not available</Text>
        <Text style={styles.helperText}>Check backend Grade data.</Text>
      </View>
    );
  }

  if (!subjectsToShow.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>No Subjects Found</Text>
        <Text style={styles.helperText}>
          Please add subjects in backend for grade {gradeNumber}
          {isAL ? " and stream" : ""}.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={[styles.title, isSi ? sinFont("bold") : null]}>{UI.title}</Text>
        <Text style={[styles.subTitle, isSi ? sinFont("regular") : null]}>{UI.selectSubject}</Text>

        <Text style={[styles.infoRow, isSi ? sinFont("regular") : null]}>
          {UI.grade} <Text style={styles.bold}>{gradeNumber}</Text>
        </Text>

        {isAL && (
          <Text style={[styles.infoRow, isSi ? sinFont("regular") : null]}>
            {UI.stream} <Text style={styles.bold}>{stream}</Text>
          </Text>
        )}

        <Text style={[styles.label, isSi ? sinFont("bold") : null]}>{UI.subject}</Text>

        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={(v) => setSelectedSubject(v)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            dropdownIconColor="#2563EB"
          >
            <Picker.Item label="Select Subject" value="" />
            {subjectsToShow.map((sub) => (
              <Picker.Item key={sub} label={sub} value={sub} />
            ))}
          </Picker>
        </View>

        <Pressable
          onPress={onContinue}
          disabled={!canStart}
          style={({ pressed }) => [
            styles.startBtn,
            !canStart && styles.startBtnDisabled,
            pressed && canStart && styles.pressed,
          ]}
        >
          <Text style={[styles.startBtnText, isSi ? sinFont("bold") : null]}>{UI.continue}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    paddingBottom: TAB_BAR_SPACE,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    lineHeight: 30,
  },

  subTitle: {
    fontSize: 15,
    color: "#334155",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 14,
    lineHeight: 24,
  },

  infoRow: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 22,
  },

  bold: {
    fontWeight: "700",
    color: "#0F172A",
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
    marginTop: 14,
  },

  pickerWrap: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },

  picker: {
    width: "100%",
    color: "#0F172A",
  },

  pickerItem: {
    fontFamily: "AbhayaLibre_700Bold",
    fontSize: 10,
    color: "#0F172A",
  },

  startBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    marginTop: 16,
  },

  startBtnDisabled: {
    backgroundColor: "#94A3B8",
  },

  startBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },

  helperText: {
    marginTop: 10,
    textAlign: "center",
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    paddingBottom: TAB_BAR_SPACE,
  },

  primaryBtn: {
    marginTop: 14,
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },

  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  },
});