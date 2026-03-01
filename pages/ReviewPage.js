import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";

import ReviewQuestionCard from "../components/ReviewQuestionCard";
import {
  useGetAttemptReviewQuery,
  useStartAttemptMutation,
} from "../app/attemptApi";
import useT from "../app/i18n/useT";

const BG = "#FFFFFF";
const TEXT_DARK = "#0F172A";
const MUTED = "#94A3B8";
const BLUE = "#2563EB";
const GREEN = "#16A34A";

function getYouTubeId(url = "") {
  try {
    const u = String(url);
    const m1 = u.match(/[?&]v=([^&]+)/);
    if (m1?.[1]) return m1[1];
    const m2 = u.match(/youtu\.be\/([^?&]+)/);
    if (m2?.[1]) return m2[1];
    const m3 = u.match(/embed\/([^?&]+)/);
    if (m3?.[1]) return m3[1];
    return "";
  } catch {
    return "";
  }
}

export default function ReviewPage({ navigation, route }) {
  const attemptId = route?.params?.attemptId || "";
  const title = route?.params?.title || "Daily Quiz";

  const { t, lang, sinFont } = useT();
  const isSi = lang === "si";

  const T = useMemo(
    () => ({
      correctAnswers: t("correctAnswersLbl"),
      reviewNotAvailable: t("reviewNotAvailableLbl"),
      examPerformance: t("examPerformanceLbl"),
      home: t("homeLbl"),
      improvementNeed: t("improvementNeedLbl"),
      allCorrect: t("allCorrectLbl"),
      explainVideo: t("explainVideoLbl"),
      stillNotAvailable: t("stillNotAvailableLbl"),
      explainLogic: t("explainLogicLbl"),
      explanation: t("explanationLbl"),
      close: t("closeLbl"),
      loadingReview: t("loadingReviewLbl"),
      retry: t("retryLbl"),
      starting: t("startingLbl"),
      retryBtn: t("retryBtnLbl"),
      startNextAttemptTitle: t("startNextAttemptTitle"),
      startNextAttemptYes: t("startNextAttemptYes"),
      cancel: t("cancelLbl"),
      cannotStartTitle: t("cannotStartTitle"),
    }),
    [t]
  );

  const { data, isLoading, isFetching, error, refetch } = useGetAttemptReviewQuery(
    { attemptId },
    { skip: !attemptId }
  );

  const result = data?.result || {};
  const wrongFirst = Array.isArray(data?.wrongFirst) ? data.wrongFirst : [];
  const correctAfter = Array.isArray(data?.correctAfter) ? data.correctAfter : [];

  const total = Number(
    result?.totalQuestions || wrongFirst.length + correctAfter.length || 0
  );
  const correctCount = Number(result?.correctCount || correctAfter.length || 0);

  const scorePercent = Number(
    result?.percentage || (total ? Math.round((correctCount / total) * 100) : 0)
  );

  const paperId = String(data?.meta?.paperId || "");
  const attemptsAllowed = Number(data?.meta?.attemptsAllowed || 1);
  const attemptNo = Number(data?.meta?.attemptNo || 1);
  const attemptsLeft = Number(data?.meta?.attemptsLeft ?? 0);
  const nextAttemptNo = Number(data?.meta?.nextAttemptNo || attemptNo + 1);

  const canRetry = !!paperId && attemptsLeft > 0;

  const [startAttempt, { isLoading: starting }] = useStartAttemptMutation();

  const [expanded, setExpanded] = useState({});
  const [videoOpen, setVideoOpen] = useState(false);
  const [logicOpen, setLogicOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState("");
  const [activeLogicText, setActiveLogicText] = useState("");

  const toggleReveal = (key) => setExpanded((p) => ({ ...p, [key]: !p?.[key] }));

  const openVideo = (item) => {
    const url = item?.explanationVideoUrl || "";
    setActiveVideoUrl(url);
    setVideoOpen(true);
  };

  const openLogic = (item) => {
    const text = item?.explanationText || "No explanation added yet.";
    setActiveLogicText(String(text));
    setLogicOpen(true);
  };

  const videoId = useMemo(() => getYouTubeId(activeVideoUrl), [activeVideoUrl]);

  const mergedList = useMemo(() => {
    if (!correctAfter.length) return wrongFirst;
    return [
      ...wrongFirst,
      { __type: "SECTION_CORRECT", _id: "__SECTION_CORRECT__" },
      ...correctAfter,
    ];
  }, [wrongFirst, correctAfter]);

  const renderItem = ({ item, index }) => {
    if (item?.__type === "SECTION_CORRECT") {
      // ✅ Correct Answers section header = GREEN + BOLD
      return (
        <Text
          style={[
            styles.sectionTitle,
            styles.sectionTitleGreen,
            isSi ? sinFont("bold") : null,
          ]}
        >
          {T.correctAnswers}
        </Text>
      );
    }

    const key = String(item?._id || index);
    const revealed = !!expanded[key];

    return (
      <ReviewQuestionCard
        item={item}
        revealed={revealed}
        onToggleReveal={() => toggleReveal(key)}
        onExplainVideo={() => openVideo(item)}
        onExplainLogic={() => openLogic(item)}
      />
    );
  };

  const onHome = () => navigation.navigate("Home");

  const onRetry = () => {
    if (!canRetry) return;

    Alert.alert(
      T.startNextAttemptTitle,
      `Do you want to practice attempt ${nextAttemptNo}?\n\nAttempts: ${attemptNo}/${attemptsAllowed} completed`,
      [
        { text: T.cancel, style: "cancel" },
        {
          text: T.startNextAttemptYes,
          onPress: async () => {
            try {
              const res = await startAttempt({ paperId }).unwrap();
              const newAttemptId = String(res?.attempt?._id || "");
              if (!newAttemptId) throw new Error("Attempt not created");

              navigation.replace("PaperPage", {
                attemptId: newAttemptId,
                paperId,
                title,
                timeMin: Number(res?.paper?.timeMinutes || 10),
              });
            } catch (e) {
              Alert.alert(
                T.cannotStartTitle,
                e?.data?.message || e?.message || "Try again"
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading || isFetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BLUE} />
        <Text style={[styles.helper, isSi ? sinFont("bold") : null]}>
          {T.loadingReview}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[styles.helper, isSi ? sinFont("bold") : null]}>
          {T.reviewNotAvailable}
        </Text>
        <Pressable style={styles.retryBtn} onPress={refetch}>
          <Text style={[styles.retryText, isSi ? sinFont("bold") : null]}>
            {T.retryBtn}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.scoreWrap}>
          <Text style={styles.scoreText}>{Math.round(scorePercent)}%</Text>

          <Text style={[styles.scoreSub, isSi ? sinFont("bold") : null]}>
            {T.examPerformance}
          </Text>

          <View style={styles.scoreBtns}>
            <Pressable onPress={onHome} style={styles.btnLight}>
              <Text style={[styles.btnLightText, isSi ? sinFont("bold") : null]}>
                {T.home}
              </Text>
            </Pressable>

            {canRetry ? (
              <Pressable
                onPress={onRetry}
                style={styles.btnBlue}
                disabled={starting}
              >
                <Text style={[styles.btnBlueText, isSi ? sinFont("bold") : null]}>
                  {starting ? T.starting : T.retry}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {wrongFirst.length > 0 ? (
          // ✅ improvement need = BOLD (no green requested)
          <Text style={[styles.sectionTitle, styles.sectionTitleBold, isSi ? sinFont("bold") : null]}>
            {T.improvementNeed}
          </Text>
        ) : (
          // ✅ Your All answers correct = GREEN + BOLD
          <Text
            style={[
              styles.sectionTitle,
              styles.sectionTitleGreen,
              isSi ? sinFont("bold") : null,
            ]}
          >
            {T.allCorrect}
          </Text>
        )}

        <FlatList
          data={mergedList}
          keyExtractor={(item, idx) => String(item?._id || idx)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />

        {/* VIDEO MODAL */}
        <Modal visible={videoOpen} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleWrap}>
                  <View style={styles.modalIconCircle}>
                    <Ionicons name="play-circle-outline" size={18} color={BLUE} />
                  </View>
                  <Text style={[styles.modalTitle, isSi ? sinFont("bold") : null]}>
                    {T.explainVideo}
                  </Text>
                </View>

                <Pressable onPress={() => setVideoOpen(false)} hitSlop={10}>
                  <Ionicons name="close" size={22} color={TEXT_DARK} />
                </Pressable>
              </View>

              <View style={styles.videoBox}>
                {videoId ? (
                  <YoutubePlayer height={210} play={false} videoId={videoId} />
                ) : (
                  <Text style={[styles.modalBody, isSi ? sinFont("bold") : null]}>
                    {T.stillNotAvailable}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* LOGIC MODAL */}
        <Modal visible={logicOpen} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleWrap}>
                  <View style={styles.modalIconCircle}>
                    <Ionicons name="bulb-outline" size={18} color={BLUE} />
                  </View>
                  <Text style={[styles.modalTitle, isSi ? sinFont("bold") : null]}>
                    {T.explainLogic}
                  </Text>
                </View>

                <Pressable onPress={() => setLogicOpen(false)} hitSlop={10}>
                  <Ionicons name="close" size={22} color={TEXT_DARK} />
                </Pressable>
              </View>

              <View style={styles.logicCard}>
                <Text style={[styles.logicLabel, isSi ? sinFont("bold") : null]}>
                  {T.explanation}
                </Text>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.logicScroll}
                >
                  <Text style={styles.logicText}>{activeLogicText}</Text>
                </ScrollView>
              </View>

              <Pressable
                onPress={() => setLogicOpen(false)}
                style={styles.logicCloseBtn}
              >
                <Text
                  style={[styles.logicCloseBtnText, isSi ? sinFont("bold") : null]}
                >
                  {T.close}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, backgroundColor: BG, paddingHorizontal: 14, paddingTop: 8 },

  scoreWrap: {
    alignSelf: "center",
    width: "85%",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    marginTop: 4,
  },

  scoreText: { fontSize: 34, fontWeight: "900", color: BLUE },

  scoreSub: {
    fontSize: 10,
    fontWeight: "800",
    color: MUTED,
    marginTop: 2,
    letterSpacing: 1,
  },

  scoreBtns: { flexDirection: "row", gap: 10, marginTop: 12 },

  btnLight: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  btnLightText: { fontWeight: "800", color: TEXT_DARK, fontSize: 12 },

  btnBlue: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: BLUE,
  },

  btnBlueText: { fontWeight: "900", color: "#FFFFFF", fontSize: 12 },

  scoreMeta: {
    marginTop: 10,
    fontSize: 12,
    color: MUTED,
    fontWeight: "700",
    textAlign: "center",
  },

  attemptMeta: {
    marginTop: 6,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "800",
    textAlign: "center",
  },

  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    color: MUTED,
    fontWeight: "800",
    fontSize: 12,
  },

  // ✅ improvement need bold
  sectionTitleBold: {
    fontWeight: "900",
  },

  // ✅ green + bold
  sectionTitleGreen: {
    color: GREEN,
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  modalTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  modalIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  modalTitle: {
    fontWeight: "900",
    fontSize: 16,
    color: TEXT_DARK,
  },

  modalBody: {
    color: TEXT_DARK,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    textAlign: "center",
    paddingVertical: 20,
  },

  videoBox: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  logicCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    maxHeight: 300,
  },

  logicLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  logicScroll: {
    paddingBottom: 4,
  },

  logicText: {
    color: TEXT_DARK,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "NotoSerifSinhala_700Bold",
  },

  logicCloseBtn: {
    marginTop: 12,
    alignSelf: "flex-end",
    backgroundColor: "#0B1220",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  logicCloseBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

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