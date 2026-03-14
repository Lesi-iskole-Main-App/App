import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useGetLessonsByClassIdQuery } from "../app/lessonApi";
import { useGetMyEnrollRequestsQuery } from "../app/enrollApi";

const PRIMARY = "#1153ec";
const TAB_BAR_SPACE = 110;

const cleanDisplayText = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.replace(/\s+/g, " ").trim();
};

export default function Lessons({ route }) {
  const navigation = useNavigation();

  const classId = route?.params?.classId || "";
  const className = route?.params?.className || "";
  const grade = route?.params?.grade || "";
  const subject = route?.params?.subject || "";
  const teacher = route?.params?.teacher || "";
  const routeEnrollStatus = String(route?.params?.enrollStatus || "").toLowerCase();
  const demoOnly = !!route?.params?.demoOnly;

  const {
    data: lessons = [],
    isLoading,
    isError,
    refetch,
  } = useGetLessonsByClassIdQuery(classId, { skip: !classId });

  const {
    data: myReqData,
    isLoading: reqLoading,
  } = useGetMyEnrollRequestsQuery();

  const currentEnrollStatus = useMemo(() => {
    if (routeEnrollStatus) return routeEnrollStatus;

    const list = myReqData?.requests || [];
    const found = list.find(
      (r) => String(r?.classId || r?.classDetails?.classId || "") === String(classId)
    );

    return String(found?.status || "").toLowerCase();
  }, [routeEnrollStatus, myReqData, classId]);

  const isApproved = currentEnrollStatus === "approved";

  const timeWithDot = (v) =>
    String(v || "")
      .trim()
      .replace(/[：:ඃ]/g, ".")
      .replace(/\s+/g, "");

  const sortedLessons = useMemo(() => {
    const toMs = (d) => {
      const dt = new Date(String(d || "").trim());
      const ms = dt.getTime();
      return Number.isFinite(ms) ? ms : 0;
    };

    return [...(lessons || [])].sort((a, b) => {
      const da = toMs(a?.date);
      const db = toMs(b?.date);
      if (da !== db) return da - db;

      const ta = timeWithDot(a?.time);
      const tb = timeWithDot(b?.time);
      return ta.localeCompare(tb);
    });
  }, [lessons]);

  const visibleLessons = useMemo(() => {
    if (isApproved && !demoOnly) return sortedLessons;
    return sortedLessons.length > 0 ? [sortedLessons[0]] : [];
  }, [sortedLessons, isApproved, demoOnly]);

  const onWatchNow = (lesson, index) => {
    navigation.navigate("ViewLesson", {
      lessonId: lesson?._id,
      lessonNo: index + 1,
      title: lesson?.title || "",
      date: lesson?.date || "",
      time: lesson?.time || "",
      description: lesson?.description || "",
      youtubeUrl: lesson?.youtubeUrl || "",
      classId,
      className,
      grade,
      subject,
      teacher,
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Lessons</Text>

      {!classId ? (
        <Text style={styles.centerInfo}>Missing class</Text>
      ) : isLoading || reqLoading ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="small" color={PRIMARY} />
          <Text style={styles.infoText}>Loading lessons...</Text>
        </View>
      ) : isError ? (
        <View style={styles.stateWrap}>
          <Text style={styles.errTitle}>Failed to load lessons</Text>
          <Pressable onPress={() => refetch?.()} style={styles.retryBtn}>
            <Text style={styles.tryAgain}>Try again</Text>
          </Pressable>
        </View>
      ) : visibleLessons.length === 0 ? (
        <Text style={styles.centerInfo}>No lessons available.</Text>
      ) : (
        <>
          {!isApproved && (
            <View style={styles.demoNoteCard}>
              <Text style={styles.demoNoteTitle}>Demo Lesson</Text>
              <Text style={styles.demoNoteText}>
                This class currently shows only the first lesson as demo.
                After enrollment approval, all lessons will be visible.
              </Text>
            </View>
          )}

          {visibleLessons.map((lesson, idx) => {
            const lessonTitle =
              cleanDisplayText(lesson?.title) ||
              `${!isApproved ? "Demo Lesson" : "Lesson"} ${idx + 1}`;
            const lessonDescription =
              cleanDisplayText(lesson?.description) || "No description available.";

            return (
              <View style={styles.card} key={lesson?._id || String(idx)}>
                <View style={styles.headerRow}>
                  <View style={styles.lessonBadge}>
                    <Text style={styles.lessonBadgeText}>
                      {!isApproved ? "Demo Lesson" : `Lesson ${idx + 1}`}
                    </Text>
                  </View>

                  <View style={styles.metaWrap}>
                    <View style={styles.metaBox}>
                      <Text style={styles.metaLabel}>Date</Text>
                      <Text style={styles.metaValue}>{lesson?.date || "-"}</Text>
                    </View>

                    <View style={styles.metaBox}>
                      <Text style={styles.metaLabel}>Time</Text>
                      <Text style={styles.metaValue}>
                        {timeWithDot(lesson?.time) || "-"}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.lessonTitle} numberOfLines={2}>
                  {lessonTitle}
                </Text>

                <View style={styles.divider} />

                <View style={styles.descCard}>
                  <Text style={styles.descLabel}>Description</Text>
                  <Text style={styles.descText} numberOfLines={3}>
                    {lessonDescription}
                  </Text>
                </View>

                <View style={styles.buttonRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.watchBtn,
                      pressed && styles.watchBtnPressed,
                    ]}
                    onPress={() => onWatchNow(lesson, idx)}
                  >
                    <Text style={styles.watchText}>Watch Now</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: TAB_BAR_SPACE },

  pageTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: PRIMARY,
    textAlign: "center",
    marginBottom: 15,
  },

  stateWrap: { paddingTop: 30, alignItems: "center" },
  infoText: {
    marginTop: 10,
    color: "#64748B",
    fontWeight: "600",
    fontSize: 13,
  },
  errTitle: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 14,
  },
  retryBtn: { marginTop: 10 },
  tryAgain: {
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 13,
  },
  centerInfo: {
    textAlign: "center",
    marginTop: 24,
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
  },

  demoNoteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D7E5FF",
  },

  demoNoteTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: PRIMARY,
    marginBottom: 4,
  },

  demoNoteText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    lineHeight: 18,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },

  lessonBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  lessonBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  metaWrap: {
    flexDirection: "row",
    gap: 6,
  },

  metaBox: {
    minWidth: 70,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },

  metaLabel: {
    fontSize: 8,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 2,
  },

  metaValue: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F172A",
  },

  lessonTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 20,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginTop: 8,
    marginBottom: 8,
  },

  descCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  descLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },

  descText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    lineHeight: 18,
  },

  buttonRow: {
    marginTop: 8,
    alignItems: "flex-end",
  },

  watchBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 98,
    alignItems: "center",
  },

  watchBtnPressed: {
    opacity: 0.9,
  },

  watchText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});