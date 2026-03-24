import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

import useUser from "../app/hooks/useUser";
import { useGetPublishedPaperSubjectsQuery } from "../app/paperApi";
import useT from "../app/i18n/useT";

const TAB_BAR_SPACE = 110;

const toTranslationKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "_");

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
  const canFetchSubjects = !!gradeNumber && (!isAL || !!stream);

  const {
    data: publishedSubjects = [],
    isLoading,
    isFetching,
    error,
  } = useGetPublishedPaperSubjectsQuery(
    {
      gradeNumber,
      paperType: "Model paper",
      stream: isAL ? stream : null,
    },
    { skip: !canFetchSubjects }
  );

  const translateStream = (value) => {
    const raw = String(value || "").trim();
    if (!raw || !isSi) return raw;

    const key = toTranslationKey(raw);
    const translated = t(key);
    return translated && translated !== key ? translated : raw;
  };

  const translatedStream = useMemo(() => {
    return translateStream(stream);
  }, [stream, lang]);

  const subjectsToShow = useMemo(() => {
    return Array.isArray(publishedSubjects)
      ? publishedSubjects
          .map((item) => {
            if (!item) return null;

            if (typeof item === "string") {
              const subject = String(item).trim();
              return subject
                ? {
                    _id: subject,
                    subject,
                  }
                : null;
            }

            if (typeof item === "object") {
              const subject = String(item.subject || "").trim();
              const _id = String(item._id || subject || "").trim();

              if (!subject) return null;

              return {
                _id,
                subject,
              };
            }

            return null;
          })
          .filter(Boolean)
      : [];
  }, [publishedSubjects]);

  useEffect(() => {
    if (!subjectsToShow.length) {
      setSelectedSubject("");
      return;
    }

    const exists = subjectsToShow.some(
      (item) => String(item.subject) === String(selectedSubject)
    );

    if (!exists) {
      setSelectedSubject("");
    }
  }, [subjectsToShow, selectedSubject]);

  const canStart = !!gradeNumber && !!selectedSubject && (!isAL || !!stream);

  const UI = {
    title: isSi ? t("mpTitle") : "Model paper",
    grade: isSi ? t("gradeLbl") : "Grade",
    stream: isSi ? t("streamLbl") : "Stream",
    continue: isSi ? t("continueLbl") : "Continue",
    notSelected:
      isSi
        ? "පළමුව grade එක (A/L නම් stream එකත්) තෝරන්න"
        : "Please select your grade (and stream for A/L) first.",
    noPapersNow: isSi
      ? "මේ මොහොතේ ප්‍රශ්න පත්‍ර ලබා ගත නොහැක"
      : "Papers are not available right now.",
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
        <Text style={[styles.title, isSi ? sinFont("bold") : null]}>
          Grade / Stream not selected
        </Text>
        <Text style={[styles.helperText, isSi ? sinFont("regular") : null]}>
          {UI.notSelected}
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

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[styles.title, isSi ? sinFont("bold") : null]}>
          Subjects not available
        </Text>
        <Text style={styles.helperText}>Check backend published model papers.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={[styles.title, isSi ? sinFont("bold") : null]}>
          {UI.title}
        </Text>

        <Text style={[styles.infoRow, isSi ? sinFont("regular") : null]}>
          {UI.grade} <Text style={styles.bold}>{gradeNumber}</Text>
        </Text>

       

        <Text style={styles.label}>Subject</Text>

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
              <Picker.Item
                key={String(sub._id)}
                label={String(sub.subject)}
                value={String(sub.subject)}
              />
            ))}
          </Picker>
        </View>

        {!subjectsToShow.length ? (
          <Text style={[styles.helperText, isSi ? sinFont("regular") : null]}>
            {UI.noPapersNow}
          </Text>
        ) : null}

        <Pressable
          onPress={onContinue}
          disabled={!canStart}
          style={({ pressed }) => [
            styles.startBtn,
            !canStart && styles.startBtnDisabled,
            pressed && canStart && styles.pressed,
          ]}
        >
          <Text style={[styles.startBtnText, isSi ? sinFont("bold") : null]}>
            {UI.continue}
          </Text>
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