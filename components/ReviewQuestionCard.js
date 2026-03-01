import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useT from "../app/i18n/useT";

const TEXT_DARK = "#0F172A";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";

const RED = "#E11D48";
const GREEN = "#16A34A";
const BLUE = "#2563EB";
const DARK = "#0B1220";

export default function ReviewQuestionCard({
  item,
  revealed,
  onToggleReveal,
  onExplainVideo,
  onExplainLogic,
}) {
  const { t, lang, sinFont } = useT();
  const isSi = lang === "si";

  const T = useMemo(
    () => ({
      question: t("questionLbl2"),
      correct: t("correctLbl"),
      wrong: t("wrongLbl"),
      hideAnswer: t("hideAnswerLbl"),
      showAnswer: t("showAnswerLbl"),
      yourAnswer: t("yourAnswerLbl"),
      correctAnswer: t("correctAnswerLbl"),
      explainLogic: t("explainLogicLbl"),
      explainVideo: t("explainVideoLbl"),
      correctAnswers: t("correctAnswersLbl"),
    }),
    [t]
  );

  const isCorrect = !!item?.isCorrect;

  const correctAnswers =
    Array.isArray(item?.correctAnswers) && item.correctAnswers.length
      ? item.correctAnswers
      : item?.correctAnswer
      ? [item.correctAnswer]
      : [];

  const userAnswer = item?.selectedAnswer || "";

  const correctAnswersLabelStyle = [
    styles.lineLabel,
    styles.lineLabelGreen,
    isSi ? sinFont("bold") : null,
  ];

  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        {/* ✅ Sinhala font ONLY for label, not ":" */}
        <Text style={styles.qNo}>
          <Text style={isSi ? sinFont("bold") : null}>{T.question}</Text>
          {" : "}
          {item?.questionNumber}
        </Text>

        <View style={[styles.badge, isCorrect ? styles.badgeGreen : styles.badgeRed]}>
          <Ionicons
            name={isCorrect ? "checkmark-circle" : "close-circle"}
            size={12}
            color="#fff"
          />
          <Text style={[styles.badgeText, isSi ? sinFont("bold") : null]}>
            {isCorrect ? T.correct : T.wrong}
          </Text>
        </View>
      </View>

      <Text style={styles.qText} numberOfLines={2}>
        {item?.question}
      </Text>

      <Pressable onPress={onToggleReveal} style={styles.revealBtn}>
        <Text style={[styles.revealText, isSi ? sinFont("bold") : null]}>
          {revealed ? T.hideAnswer : T.showAnswer}
        </Text>
        <Ionicons
          name={revealed ? "chevron-up" : "chevron-down"}
          size={16}
          color={DARK}
        />
      </Pressable>

      {revealed && (
        <View style={styles.revealBox}>
          <View style={styles.answerRow}>
            <Text style={[styles.lineLabel, isSi ? sinFont("bold") : null]}>
              {T.yourAnswer}
            </Text>
            <Text
              style={[
                styles.lineValue,
                styles.fetchText,
                !isCorrect && { color: RED },
              ]}
              numberOfLines={2}
            >
              {userAnswer || "-"}
            </Text>
          </View>

          {correctAnswers.length <= 1 ? (
            <View style={styles.answerRow}>
              <Text style={[styles.lineLabel, isSi ? sinFont("bold") : null]}>
                {T.correctAnswer}
              </Text>
              <Text
                style={[styles.lineValue, styles.fetchText, { color: GREEN }]}
                numberOfLines={2}
              >
                {correctAnswers[0] || "-"}
              </Text>
            </View>
          ) : (
            <View style={styles.answerRow}>
              {/* ✅ Correct Answers label must be GREEN + BOLD */}
              <Text style={correctAnswersLabelStyle}>{T.correctAnswers}</Text>

              <Text
                style={[styles.lineValue, styles.fetchText, { color: GREEN }]}
                numberOfLines={3}
              >
                {correctAnswers.join(", ")}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <Pressable onPress={onExplainLogic} style={styles.btnDark}>
              <Ionicons name="bulb-outline" size={14} color="#FFFFFF" />
              <Text style={[styles.btnDarkText, isSi ? sinFont("bold") : null]}>
                {T.explainLogic}
              </Text>
            </Pressable>

            <Pressable onPress={onExplainVideo} style={styles.btnBlue}>
              <Ionicons name="play-circle-outline" size={14} color="#FFFFFF" />
              <Text style={[styles.btnBlueText, isSi ? sinFont("bold") : null]}>
                {T.explainVideo}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
    marginBottom: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  qNo: {
    fontSize: 10,
    fontWeight: "900",
    color: MUTED,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badgeGreen: { backgroundColor: GREEN },
  badgeRed: { backgroundColor: RED },

  badgeText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 9,
  },

  qText: {
    marginTop: 6,
    fontSize: 12,
    color: TEXT_DARK,
    lineHeight: 18,
    fontFamily: "NotoSerifSinhala_700Bold",
  },

  revealBtn: {
    marginTop: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  revealText: {
    fontWeight: "900",
    color: DARK,
    fontSize: 10,
  },

  revealBox: {
    marginTop: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },

  answerRow: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginTop: 6,
  },

  lineLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: MUTED,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  // ✅ GREEN label for "Correct Answers"
  lineLabelGreen: {
    color: GREEN,
    fontWeight: "900",
  },

  lineValue: {
    fontSize: 11,
    lineHeight: 16,
  },

  fetchText: {
    fontFamily: "NotoSerifSinhala_700Bold",
  },

  actions: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },

  btnDark: {
    flex: 1,
    backgroundColor: DARK,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },

  btnDarkText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 10,
  },

  btnBlue: {
    flex: 1,
    backgroundColor: BLUE,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },

  btnBlueText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 10,
  },
});