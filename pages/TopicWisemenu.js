// pages/TopicWiseMenu.js ✅ FULL FILE (design NOT changed, only added sinFont styles)

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useGetPublishedPapersQuery } from "../app/paperApi";
import {
  useStartAttemptMutation,
  useGetMyAttemptsByPaperQuery,
} from "../app/attemptApi";
import useT from "../app/i18n/useT";

const PRIMARY = "#1153ec";

const PaymentBadge = ({ payment, amount, T, isSi, sinFont }) => {
  const type = String(payment || "free").toLowerCase();
  const isPaid = type === "paid";
  const isPractice = type === "practise" || type === "practice";

  const bg = isPaid ? "#FEE2E2" : isPractice ? "#FEF3C7" : "#DCFCE7";
  const text = isPaid ? "#991B1B" : isPractice ? "#92400E" : "#166534";

  const label = isPaid
    ? `${T.paid} • Rs ${Number(amount || 0)}`
    : isPractice
    ? T.practise
    : T.free;

  return (
    <View style={[styles.badgeTopRight, { backgroundColor: bg }]}>
      <Text
        style={[
          styles.badgeText,
          { color: text },
          isSi ? sinFont("bold") : null,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const PaperCard = ({ paper, context, onAttemptNow, onViewResult, starting, T, isSi, sinFont }) => {
  const attemptsLeft = Number(context?.attemptsLeft ?? paper.attempts);
  const isOver = attemptsLeft <= 0;

  const btnText = isOver ? T.viewResult : T.attemptNow;

  const onPress = () => {
    if (isOver) return onViewResult?.(paper, context);
    return onAttemptNow?.(paper);
  };

  return (
    <View style={styles.card}>
      <PaymentBadge payment={paper.payment} amount={paper.amount} T={T} isSi={isSi} sinFont={sinFont} />

      {/* ❌ backend title => do not translate */}
      <Text style={styles.cardTitle}>{paper.title}</Text>

      <View style={styles.metaRowCenter}>
        <View style={styles.metaItem}>
          <Ionicons name="help-circle-outline" size={16} color="#64748B" />
          <Text style={[styles.metaText, isSi ? sinFont("bold") : null]}>
            {paper.mcqCount} {T.mcqs}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color="#64748B" />
          <Text style={[styles.metaText, isSi ? sinFont("bold") : null]}>
            {paper.timeMin} {T.min}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Ionicons name="repeat-outline" size={16} color="#64748B" />
          {/* "left" not requested to translate */}
          <Text style={styles.metaText}>
            {Math.max(attemptsLeft, 0)}/{paper.attempts} left
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onPress}
        disabled={starting}
        style={({ pressed }) => [
          styles.btn,
          pressed && styles.btnPressed,
          starting && { opacity: 0.6 },
          isOver && styles.btnLight,
        ]}
      >
        <Text style={[styles.btnText, isOver && styles.btnTextDark, isSi ? sinFont("bold") : null]}>
          {starting ? T.pleaseWait : btnText}
        </Text>
        <Ionicons
          name={isOver ? "document-text-outline" : "arrow-forward"}
          size={18}
          color={isOver ? "#0F172A" : "#FFFFFF"}
        />
      </Pressable>
    </View>
  );
};

const PaperCardWithAttempts = ({ paper, onAttemptNow, onViewResult, starting, T, isSi, sinFont }) => {
  const { data: context, isFetching } = useGetMyAttemptsByPaperQuery(
    { paperId: paper.id },
    { skip: !paper?.id }
  );
  const safeContext = isFetching ? null : context;

  return (
    <PaperCard
      paper={paper}
      context={safeContext}
      onAttemptNow={onAttemptNow}
      onViewResult={onViewResult}
      starting={starting}
      T={T}
      isSi={isSi}
      sinFont={sinFont}
    />
  );
};

export default function TopicWiseMenu({ route }) {
  const navigation = useNavigation();
  const { t, lang, sinFont } = useT();
  const isSi = lang === "si";

  const T = useMemo(
    () => ({
      pageTitle: t("twTitle"),
      attemptNow: t("attemptNow"),
      pleaseWait: t("pleaseWait"),
      mcqs: t("mcqs"),
      min: t("min"),
      paid: t("paid"),
      practise: t("practise"),
      free: t("free"),
      viewResult: t("viewResult"),
    }),
    [t]
  );

  const { gradeNumber, stream, subject } = route?.params || {};

  const canFetch = !!gradeNumber && !!subject && (Number(gradeNumber) < 12 || !!stream);

  const { data: papersRaw = [], isLoading, isFetching, error } =
    useGetPublishedPapersQuery(
      {
        gradeNumber,
        paperType: "Topic wise paper",
        stream: Number(gradeNumber) >= 12 ? stream : null,
        subject,
      },
      { skip: !canFetch }
    );

  const PAPERS = useMemo(() => {
    return (Array.isArray(papersRaw) ? papersRaw : []).map((p) => ({
      id: String(p?._id),
      title: String(p?.paperTitle || "Topic Wise Paper"),
      mcqCount: Number(p?.questionCount || 0),
      timeMin: Number(p?.timeMinutes || 0),
      attempts: Number(p?.attempts || 1),
      payment: p?.payment,
      amount: Number(p?.amount || 0),
    }));
  }, [papersRaw]);

  const [startAttempt, { isLoading: starting }] = useStartAttemptMutation();

  const onAttemptNow = async (paper) => {
    try {
      const res = await startAttempt({ paperId: paper.id }).unwrap();
      const attemptId = String(res?.attempt?._id || "");
      if (!attemptId) throw new Error("Attempt not created");

      navigation.navigate("PaperPage", {
        attemptId,
        paperId: paper.id,
        title: paper.title,
        timeMin: Number(res?.paper?.timeMinutes || paper.timeMin || 10),
      });
    } catch (e) {
      console.log("startAttempt error:", e);
      Alert.alert("Cannot start", e?.data?.message || e?.message || "Try again");
    }
  };

  const onViewResult = (paper, context) => {
    const attemptId = String(context?.lastAttemptId || "");
    if (!attemptId) {
      Alert.alert("No result", "No submitted attempt found for this paper.");
      return;
    }
    navigation.navigate("ReviewPage", { attemptId, title: paper.title });
  };

  return (
    <View style={styles.screen}>
      <Text style={[styles.pageTitle, isSi ? sinFont("bold") : null]}>{T.pageTitle}</Text>
      
      {!canFetch ? (
        <View style={styles.center}>
          <Text style={styles.infoText}>Grade / Stream / Subject not selected</Text>
        </View>
      ) : isLoading || isFetching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.infoText}>Loading papers...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.infoText}>Papers not available</Text>
          <Text style={styles.infoTextSmall}>Check backend published papers.</Text>
        </View>
      ) : !PAPERS.length ? (
        <View style={styles.center}>
          <Text style={styles.infoText}>No Topic Wise Papers Found</Text>
          <Text style={styles.infoTextSmall}>Please publish topic wise papers in dashboard.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {PAPERS.map((p) => (
            <PaperCardWithAttempts
              key={p.id}
              paper={p}
              onAttemptNow={onAttemptNow}
              onViewResult={onViewResult}
              starting={starting}
              T={T}
              isSi={isSi}
              sinFont={sinFont}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC", padding: 16, paddingTop: 18 },
  pageTitle: { fontSize: 22, fontWeight: "900", color: PRIMARY, textAlign: "center" },
  pageSub: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
  },
  list: { paddingBottom: 24, gap: 12 },

  card: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 3,
    overflow: "hidden",
  },

  badgeTopRight: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    zIndex: 10,
  },
  badgeText: { fontWeight: "900", fontSize: 10 },

  cardTitle: { fontSize: 15, fontWeight: "900", color: "#0F172A", textAlign: "center" },

  metaRowCenter: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  metaText: { fontSize: 11, fontWeight: "800", color: "#475569" },

  btn: {
    marginTop: 12,
    height: 44,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnLight: { backgroundColor: "#EEF2FF", borderWidth: 1, borderColor: "#C7D2FE" },
  btnPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  btnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  btnTextDark: { color: "#0F172A" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  infoText: { fontSize: 14, fontWeight: "900", color: "#0F172A", textAlign: "center" },
  infoTextSmall: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
  },
});