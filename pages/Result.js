import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import coins from "../assets/coins.png";
import { useGetMyCompletedPapersQuery } from "../app/attemptApi";
import useT from "../app/i18n/useT";

export default function Result() {
  const { t, lang, sinFont } = useT();

  const { data, isLoading, isError } = useGetMyCompletedPapersQuery();
  const items = Array.isArray(data?.items) ? data.items : [];

  const isSi = lang === "si";

  // ✅ ONLY THESE LABELS translated
  const UI = {
    pageTitle: isSi ? t("resultTitle") : "Result",
    total: isSi ? t("resultTotal") : "Total",
    correct: isSi ? t("resultCorrect") : "Correct",
    percentage: isSi ? t("resultPercentage") : "Percentage",
    best: isSi ? t("resultBest") : "Best Completed Result",
    empty: isSi ? t("noCompletedPapersYet") : "No completed papers yet",
  };

  // ✅ Sinhala legacy font ONLY for translated labels
  const LBL_REG = isSi ? sinFont("regular") : null;
  const LBL_BOLD = isSi ? sinFont("bold") : null;

  return (
    <View style={styles.screen}>
      <Text style={[styles.pageTitle, LBL_BOLD]}>{UI.pageTitle}</Text>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator size="large" color="#214294" />
            <Text style={[styles.infoText, LBL_REG]}>
              {t("loadingReviewLbl")}
            </Text>
          </View>
        ) : isError ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorText}>Failed to load results</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={[styles.emptyText, LBL_REG]}>{UI.empty}</Text>
          </View>
        ) : (
          items.map((paper) => {
            const r = {
              total: Number(paper.totalQuestions || 0),
              correct: Number(paper.correct || 0),
              percent: Number(paper.percentage || 0),
              subject: String(paper.subject || ""),
              coins: Number(paper.coins || 0),
            };

            return (
              <View key={paper.paperId} style={styles.paperCard}>
                <View style={styles.headerRow}>
                  <View style={styles.headerLeft}>
                    <Text style={styles.paperTitle} numberOfLines={1}>
                      {paper.paperTitle}
                    </Text>

                    <Text style={styles.subjectText} numberOfLines={1}>
                      {r.subject || "Subject"}
                    </Text>
                  </View>

                  <View style={styles.coinBadge}>
                    <Image source={coins} style={styles.coinImg} />
                    <Text style={styles.coinCount}>{r.coins}</Text>
                  </View>
                </View>

                <View style={styles.statsBox}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, LBL_REG]} numberOfLines={1}>
                      {UI.total}
                    </Text>
                    <Text style={styles.statValue}>{r.total}</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, LBL_REG]} numberOfLines={1}>
                      {UI.correct}
                    </Text>
                    <Text style={styles.statValue}>{r.correct}</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, LBL_REG]} numberOfLines={1}>
                      {UI.percentage}
                    </Text>
                    <Text style={styles.statValue}>{r.percent}%</Text>
                  </View>
                </View>

                <View style={styles.resultFooter}>
                  <Text style={[styles.resultFooterText, LBL_BOLD]}>
                    {UI.best}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 22,
  },

  pageTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#214294",
    textAlign: "center",
    marginBottom: 10,
  },

  list: {
    paddingBottom: 120,
  },

  stateWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 30,
  },

  infoText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
  },

  stateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    color: "#E11D48",
    fontWeight: "800",
    textAlign: "center",
    fontSize: 14,
  },

  emptyText: {
    color: "#64748B",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
  },

  paperCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },

  headerLeft: {
    flex: 1,
    paddingRight: 4,
  },

  paperTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 16,
  },

  subjectText: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },

  coinBadge: {
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },

  coinImg: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginBottom: 1,
  },

  coinCount: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9A3412",
  },

  statsBox: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
  },

  statItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 3,
  },

  statDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
  },

  statLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 2,
    textAlign: "center",
  },

  statValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
  },

  resultFooter: {
    marginTop: 8,
    alignSelf: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  resultFooterText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#1D4ED8",
    letterSpacing: 0.1,
  },
});