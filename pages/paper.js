// pages/PaperPage.js ✅ FULL FILE
// ✅ only translate: Question / FINISH / Next Question / Previous / Submit
// ✅ IMPORTANT: FMEmaneex converts ":" to Sinhala glyph, so timer must NOT use sinFont()

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import PaperComponent from "../components/PaperComponent";
import {
  useGetAttemptQuestionsQuery,
  useSaveAnswerMutation,
  useSubmitAttemptMutation,
} from "../app/attemptApi";
import useT from "../app/i18n/useT";

const BG = "#FFFFFF";
const TEXT_DARK = "#0F172A";

const FINISH_BLUE = "#2563EB";
const TIMER_BG = "#FFECEC";
const TIMER_TEXT = "#E11D48";

const NEXT_BG = "#0B1220";
const NEXT_TEXT = "#FFFFFF";
const BOTTOM_BAR_BG = "#94A3B8";

function formatTime(seconds) {
  const safe = Math.max(0, Number(seconds || 0));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function PaperPage({ navigation, route }) {
  const { t, lang, sinFont } = useT();
  const isSi = lang === "si";

  const T = useMemo(
    () => ({
      question: t("questionLbl"),
      finish: t("finishLbl"),
      nextQuestion: t("nextQuestionLbl"),
      previous: t("previousLbl"),
      submit: t("submitLbl"),
    }),
    [t]
  );

  const attemptId = route?.params?.attemptId || "";
  const paperId = route?.params?.paperId || "";
  const title = route?.params?.title || "Daily Quiz";
  const fallbackTimeMin = Number(route?.params?.timeMin || 10);

  const finishedRef = useRef(false);
  const intervalRef = useRef(null);

  const { data, isLoading, isFetching, error, refetch } =
    useGetAttemptQuestionsQuery({ attemptId }, { skip: !attemptId });

  const [saveAnswer] = useSaveAnswerMutation();
  const [submitAttempt] = useSubmitAttemptMutation();

  const questions = useMemo(
    () => (Array.isArray(data?.questions) ? data.questions : []),
    [data]
  );
  const timeMin = Number(data?.paper?.timeMinutes || fallbackTimeMin || 10);
  const total = questions.length;

  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(timeMin * 60);

  useEffect(() => {
    if (!questions.length) return;
    const map = {};
    questions.forEach((q, i) => {
      if (typeof q?.selectedAnswerIndex === "number")
        map[i] = q.selectedAnswerIndex;
    });
    setAnswers(map);
    setQIndex(0);
  }, [questions]);

  useEffect(() => {
    setSecondsLeft(timeMin * 60);
  }, [timeMin]);

  useEffect(() => {
    if (!attemptId) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [attemptId]);

  useEffect(() => {
    if (secondsLeft === 0) onFinish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const current = questions[qIndex];
  const selectedOption = answers[qIndex];

  const canNext = qIndex < total - 1;
  const canPrev = qIndex > 0;

  const goNext = () => canNext && setQIndex((p) => p + 1);
  const goPrev = () => canPrev && setQIndex((p) => p - 1);

  const onSelect = async (optIndex) => {
    try {
      setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
      if (!current?._id) return;

      await saveAnswer({
        attemptId,
        questionId: current._id,
        selectedAnswerIndex: optIndex,
      }).unwrap();
    } catch (e) {
      console.log("saveAnswer error:", e);
      Alert.alert("Error", e?.data?.message || "Failed to save answer");
    }
  };

  const onFinish = async (autoFinish = false) => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    if (intervalRef.current) clearInterval(intervalRef.current);

    try {
      const res = await submitAttempt({ attemptId }).unwrap();

      navigation.replace("ReviewPage", {
        attemptId,
        paperId,
        title,
        autoFinish,
        scorePercent: Number(res?.percentage || 0),
      });
    } catch (e) {
      console.log("submitAttempt error:", e);
      Alert.alert("Error", e?.data?.message || "Submit failed");
      finishedRef.current = false;
    }
  };

  if (isLoading || isFetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.helper}>Loading questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.helper}>Questions not available</Text>
        <Pressable style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!total) {
    return (
      <View style={styles.center}>
        <Text style={styles.helper}>No questions found</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            navigation.goBack();
          }}
          hitSlop={10}
        >
          <Ionicons name="close" size={22} color={TEXT_DARK} />
        </Pressable>

        <View style={styles.timerPill}>
          {/* ✅ DO NOT use sinFont here (":" issue) */}
          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
        </View>

        <Pressable onPress={() => onFinish(false)} hitSlop={10}>
          <Text style={[styles.finishText, isSi ? sinFont("bold") : null]}>
            {T.finish}
          </Text>
        </Pressable>
      </View>

      <View style={styles.centerArea}>
        <View style={styles.centerBox}>
          <PaperComponent
            index={qIndex}
            total={total}
            questionLbl={T.question}
            question={{
              id: current._id,
              question: current.question,
              answers: current.answers,
              lessonName: current.lessonName,
              imageUrl: current.imageUrl,
            }}
            selectedOption={selectedOption}
            onSelect={onSelect}
          />
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Pressable onPress={goPrev} disabled={!canPrev}>
          <Text
            style={[
              styles.prevText,
              !canPrev && styles.disabledText,
              isSi ? sinFont("bold") : null,
            ]}
          >
            {T.previous}
          </Text>
        </Pressable>

        {canNext ? (
          <Pressable onPress={goNext} style={styles.nextBtn}>
            <Text style={[styles.nextText, isSi ? sinFont("bold") : null]}>
              {T.nextQuestion}
            </Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => onFinish(false)} style={styles.nextBtn}>
            <Text style={[styles.nextText, isSi ? sinFont("bold") : null]}>
              {T.submit}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  topBar: {
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timerPill: {
    backgroundColor: TIMER_BG,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  timerText: { color: TIMER_TEXT, fontWeight: "800", fontSize: 12 },
  finishText: { color: FINISH_BLUE, fontWeight: "800", fontSize: 12 },
  centerArea: { flex: 1, justifyContent: "center", paddingHorizontal: 16 },
  centerBox: { width: "100%", maxWidth: 520, alignSelf: "center" },
  bottomBar: {
    backgroundColor: BOTTOM_BAR_BG,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  prevText: { color: TEXT_DARK, fontWeight: "800", fontSize: 13 },
  disabledText: { color: "#E2E8F0", opacity: 0.7 },
  nextBtn: {
    backgroundColor: NEXT_BG,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
  },
  nextText: { color: NEXT_TEXT, fontWeight: "900", fontSize: 13 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  helper: {
    marginTop: 10,
    textAlign: "center",
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: { color: "#fff", fontWeight: "900" },
});