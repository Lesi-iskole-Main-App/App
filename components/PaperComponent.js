// components/PaperComponent.js ✅ FULL FILE
// ✅ only translate "Question" label passed from PaperPage
// ✅ IMPORTANT: FMEmaneex converts ":" and "/" to Sinhala glyphs
// ✅ So apply sinFont ONLY to the label part, NOT to "1 / 4"

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import useT from "../app/i18n/useT";

const TEXT_DARK = "#0F172A";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const BLUE = "#2563EB";

export default function PaperComponent({
  index,
  total,
  question,
  selectedOption,
  onSelect,
  questionLbl, // ✅ translated label only
}) {
  const { lang, sinFont } = useT();
  const isSi = lang === "si";

  const q = question || {};
  const options = Array.isArray(q.answers) ? q.answers : [];

  return (
    <View style={styles.card}>
      {/* ✅ Sinhala font ONLY for label; keep numbers + "/" in default font */}
      <Text style={styles.topCount}>
        <Text style={isSi ? sinFont("bold") : null}>{questionLbl}</Text>{" "}
        {index + 1} / {total}
      </Text>

      <Text style={styles.qText}>{q.question}</Text>

      <View style={{ marginTop: 12, gap: 10 }}>
        {options.map((opt, i) => {
          const active = selectedOption === i;
          return (
            <Pressable
              key={`${q._id || "q"}-${i}`}
              onPress={() => onSelect(i)}
              style={({ pressed }) => [
                styles.opt,
                active && styles.optActive,
                pressed && { opacity: 0.92 },
              ]}
            >
              <View style={[styles.dot, active && styles.dotActive]} />
              <Text style={[styles.optText, active && styles.optTextActive]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  topCount: {
    fontSize: 12,
    fontWeight: "900",
    color: MUTED,
  },

  lesson: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "900",
    color: BLUE,
  },

  qText: {
    marginTop: 10,
    fontSize: 15,
    color: TEXT_DARK,
    lineHeight: 22,
    fontFamily: "NotoSerifSinhala_700Bold",
  },

  opt: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  optActive: {
    borderColor: BLUE,
    backgroundColor: "#EFF6FF",
  },

  dot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#94A3B8",
  },

  dotActive: {
    borderColor: BLUE,
    backgroundColor: BLUE,
  },

  optText: {
    flex: 1,
    fontSize: 13,
    color: TEXT_DARK,
    fontFamily: "AbhayaLibre_300Bold",
  },

  optTextActive: {
    color: BLUE,
  },

  helper: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: "700",
    color: MUTED,
    textAlign: "center",
  },
});